"""Contrastive capability analysis — implements docs/DESIGN.md's formulas exactly.

    ER+(c) = |{i : ℓ_i^c=LACKING, y_i=1}| / |{i : ℓ_i^c≠NA, y_i=1}|      noise floor
    ER-(c) = |{i : ℓ_i^c=LACKING, y_i=0}| / |{i : ℓ_i^c≠NA, y_i=0}|      failure rate
    Δ(c)   = ER-(c) - ER+(c)                                            contrastive gap
    Cov(c) = |{i : ℓ_i^c=LACKING, y_i=0}| / |D-|                        coverage

Δ(c) says whether a deficit is causal; Cov(c) says how much of the failure
surface it explains — together they rank which deficits are worth a LoRA
adapter (`rank_deficits`, thresholded at TRACE's published Δ≥0.20/Cov≥0.10,
overridable — DESIGN.md pins the formulas, not the numbers).
"""

from __future__ import annotations

from collections import defaultdict

from vektori_backend.diagnosis.models import CapabilityLabel, DeficitScore, Label, TrajectoryRecord

DEFAULT_GAP_THRESHOLD = 0.20
DEFAULT_COVERAGE_THRESHOLD = 0.10


def _outcomes_by_id(records: list[TrajectoryRecord]) -> dict[str, bool]:
    return {r.trajectory_id: r.outcome for r in records}


def noise_floor(capability: str, labels: list[CapabilityLabel], outcomes: dict[str, bool]) -> float:
    """ER+(c): among wins where c was relevant, how often it was still missing."""
    relevant_wins = 0
    lacking_wins = 0
    for lab in labels:
        if lab.capability != capability or lab.label == Label.NA:
            continue
        if not outcomes.get(lab.trajectory_id, False):
            continue
        relevant_wins += 1
        if lab.label == Label.LACKING:
            lacking_wins += 1
    return 0.0 if relevant_wins == 0 else lacking_wins / relevant_wins


def failure_rate(
    capability: str, labels: list[CapabilityLabel], outcomes: dict[str, bool]
) -> float:
    """ER-(c): among losses where c was relevant, how often it was missing."""
    relevant_losses = 0
    lacking_losses = 0
    for lab in labels:
        if lab.capability != capability or lab.label == Label.NA:
            continue
        if outcomes.get(lab.trajectory_id, True):
            continue
        relevant_losses += 1
        if lab.label == Label.LACKING:
            lacking_losses += 1
    return 0.0 if relevant_losses == 0 else lacking_losses / relevant_losses


def contrastive_gap(
    capability: str, labels: list[CapabilityLabel], outcomes: dict[str, bool]
) -> float:
    """Δ(c) — high Δ means c's absence actually causes failure, not incidental."""
    return failure_rate(capability, labels, outcomes) - noise_floor(capability, labels, outcomes)


def coverage(capability: str, labels: list[CapabilityLabel], outcomes: dict[str, bool]) -> float:
    """Cov(c) — of ALL failures (not just ones where c was relevant), the share this deficit touches."""
    total_losses = sum(1 for won in outcomes.values() if not won)
    if total_losses == 0:
        return 0.0
    lacking_losses = sum(
        1
        for lab in labels
        if lab.capability == capability
        and lab.label == Label.LACKING
        and not outcomes.get(lab.trajectory_id, True)
    )
    return lacking_losses / total_losses


def rank_deficits(
    records: list[TrajectoryRecord],
    labels: list[CapabilityLabel],
    *,
    threshold_gap: float = DEFAULT_GAP_THRESHOLD,
    threshold_coverage: float = DEFAULT_COVERAGE_THRESHOLD,
) -> list[DeficitScore]:
    """Score every labeled capability and keep only ones clearing both thresholds.

    Returns retained capabilities sorted by Δ(c) descending — the ranking
    DESIGN.md says decides which deficits are "worth a LoRA adapter."
    """
    outcomes = _outcomes_by_id(records)
    capabilities = sorted({lab.capability for lab in labels})

    contributing: dict[str, list[str]] = defaultdict(list)
    for lab in labels:
        if lab.label == Label.LACKING and not outcomes.get(lab.trajectory_id, True):
            contributing[lab.capability].append(lab.trajectory_id)

    scores: list[DeficitScore] = []
    for cap in capabilities:
        er_plus = noise_floor(cap, labels, outcomes)
        er_minus = failure_rate(cap, labels, outcomes)
        gap = er_minus - er_plus
        cov = coverage(cap, labels, outcomes)
        if gap >= threshold_gap and cov >= threshold_coverage:
            scores.append(
                DeficitScore(
                    capability=cap,
                    noise_floor=er_plus,
                    failure_rate=er_minus,
                    contrastive_gap=gap,
                    coverage=cov,
                    contributing_trajectory_ids=contributing[cap],
                )
            )

    return sorted(scores, key=lambda s: s.contrastive_gap, reverse=True)
