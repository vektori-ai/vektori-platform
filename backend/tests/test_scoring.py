"""Hand-computed checks against docs/DESIGN.md's formulas directly."""

from __future__ import annotations

import pytest

from vektori_backend.diagnosis.models import (
    CapabilityLabel,
    Label,
    Provenance,
    TrajectoryRecord,
)
from vektori_backend.diagnosis.scoring import (
    contrastive_gap,
    coverage,
    failure_rate,
    noise_floor,
    rank_deficits,
)

_PROV = Provenance(
    repo="acme/widgets", base_commit="deadbeef", pr_url="https://x/1", touched_files=[]
)


def _record(traj_id: str, outcome: bool) -> TrajectoryRecord:
    return TrajectoryRecord(
        trajectory_id=traj_id,
        task_id=f"task-{traj_id}",
        transcript="",
        reward=1.0 if outcome else 0.0,
        outcome=outcome,
        provenance=_PROV,
    )


def test_design_doc_worked_example():
    # 10 trajectories: 5 wins, 5 losses.
    # Capability "soft_delete": relevant in all 10.
    #   wins:   LACKING in 1/5   -> ER+ = 0.2
    #   losses: LACKING in 4/5   -> ER- = 0.8
    #   Delta = 0.8 - 0.2 = 0.6          (clears 0.20 threshold)
    #   Coverage = 4 lacking-losses / 5 total losses = 0.8   (clears 0.10 threshold)
    records = [_record(f"w{i}", True) for i in range(5)] + [
        _record(f"l{i}", False) for i in range(5)
    ]

    win_labels = [Label.LACKING] + [Label.PRESENT] * 4
    loss_labels = [Label.LACKING] * 4 + [Label.PRESENT]
    labels = [
        CapabilityLabel(trajectory_id=f"w{i}", capability="soft_delete", label=win_labels[i])
        for i in range(5)
    ] + [
        CapabilityLabel(trajectory_id=f"l{i}", capability="soft_delete", label=loss_labels[i])
        for i in range(5)
    ]
    outcomes = {r.trajectory_id: r.outcome for r in records}

    assert noise_floor("soft_delete", labels, outcomes) == 0.2
    assert failure_rate("soft_delete", labels, outcomes) == 0.8
    assert contrastive_gap("soft_delete", labels, outcomes) == pytest.approx(0.6)
    assert coverage("soft_delete", labels, outcomes) == pytest.approx(0.8)

    ranked = rank_deficits(records, labels)
    assert len(ranked) == 1
    assert ranked[0].capability == "soft_delete"
    assert set(ranked[0].contributing_trajectory_ids) == {"l0", "l1", "l2", "l3"}


def test_na_labels_excluded_from_denominators():
    records = [_record("a", True), _record("b", False)]
    labels = [
        CapabilityLabel(trajectory_id="a", capability="x", label=Label.NA),
        CapabilityLabel(trajectory_id="b", capability="x", label=Label.LACKING),
    ]
    outcomes = {r.trajectory_id: r.outcome for r in records}
    # "a" (win) is NA -> excluded from ER+ denominator -> ER+ undefined -> 0.0 by convention
    assert noise_floor("x", labels, outcomes) == 0.0
    assert failure_rate("x", labels, outcomes) == 1.0


def test_no_relevant_losses_zeros_out_not_crashes():
    records = [_record("a", True)]
    labels = [CapabilityLabel(trajectory_id="a", capability="x", label=Label.PRESENT)]
    outcomes = {r.trajectory_id: r.outcome for r in records}
    assert failure_rate("x", labels, outcomes) == 0.0
    assert coverage("x", labels, outcomes) == 0.0


def test_gap_below_threshold_is_dropped():
    # ER+ = 0.5, ER- = 0.6 -> gap = 0.1 < 0.20 default threshold
    records = [_record("w0", True), _record("w1", True), _record("l0", False), _record("l1", False)]
    labels = [
        CapabilityLabel(trajectory_id="w0", capability="x", label=Label.LACKING),
        CapabilityLabel(trajectory_id="w1", capability="x", label=Label.PRESENT),
        CapabilityLabel(trajectory_id="l0", capability="x", label=Label.PRESENT),
        CapabilityLabel(trajectory_id="l1", capability="x", label=Label.LACKING),
    ]
    assert rank_deficits(records, labels) == []


def test_coverage_below_threshold_is_dropped_even_with_high_gap():
    # capability "y" only relevant to 1 of 20 losses -> low coverage even if gap is huge
    records = [_record(f"l{i}", False) for i in range(20)] + [_record("w0", True)]
    labels = [CapabilityLabel(trajectory_id="l0", capability="y", label=Label.LACKING)]
    ranked = rank_deficits(records, labels, threshold_gap=0.0)
    assert ranked == []  # coverage = 1/20 = 0.05 < 0.10 default
