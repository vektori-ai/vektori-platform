"""Data contract for capability diagnosis — mirrors docs/DESIGN.md's notation directly.

D = {(x_i, τ_i, r_i, y_i)}    dataset of N attempts
ℓ_i^c ∈ {NA, PRESENT, LACKING}    per-trajectory label for capability c
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum


class Label(StrEnum):
    """ℓ_i^c — whether capability c was needed, and if so, whether it was exercised."""

    NA = "NA"
    PRESENT = "PRESENT"
    LACKING = "LACKING"


@dataclass(slots=True)
class Provenance:
    """Sourced from a task's `[metadata.repo2env]` block + its oracle diff."""

    repo: str  # "owner/name"
    base_commit: str
    pr_url: str
    touched_files: list[str]


@dataclass(slots=True)
class TrajectoryRecord:
    """One attempt: (x_i, τ_i, r_i, y_i) plus the provenance of the task it ran against."""

    trajectory_id: str
    task_id: str  # x_i — which task this trajectory is for
    transcript: str  # τ_i — full agent trajectory (tool calls, reasoning, output)
    reward: float  # r_i — graded reward (e.g. f2p_rate * p2p_rate)
    outcome: bool  # y_i — 1 (win) / 0 (loss); reward thresholded, or the task's own pass/fail
    provenance: Provenance


@dataclass(slots=True)
class CapabilityLabel:
    """ℓ_i^c for one (trajectory, capability) pair, from the analysis agent."""

    trajectory_id: str
    capability: str
    label: Label
    rationale: str = ""


@dataclass(slots=True)
class DeficitScore:
    """Contrastive analysis output for one capability, per DESIGN.md."""

    capability: str
    noise_floor: float  # ER+(c)
    failure_rate: float  # ER-(c)
    contrastive_gap: float  # Δ(c) = ER-(c) - ER+(c)
    coverage: float  # Cov(c)
    contributing_trajectory_ids: list[str] = field(default_factory=list)
