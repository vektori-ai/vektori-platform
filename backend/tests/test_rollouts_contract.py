"""rollouts.py's glue against real envgen/diagnosis types — no Docker, no network.

Uses the real fixture task dir (tests/fixtures/encode__httpx-3367) so
`run_baseline` exercises the real `provenance.parse_task_provenance` path,
just with a fake agent standing in for the model under test.
"""

from __future__ import annotations

from pathlib import Path

from vektori_backend.diagnosis.models import TrajectoryRecord
from vektori_backend.diagnosis.rollouts import AgentRunner, RolloutResult, run_baseline

FIXTURE = Path(__file__).parent / "fixtures" / "encode__httpx-3367"


class _FakeAgentRunner:
    """Stands in for a real Harbor-driven model run — scripted outcome per task."""

    def __init__(self, outcome: bool, reward: float = 1.0):
        self.outcome = outcome
        self.reward = reward
        self.calls: list[Path] = []

    def run(self, task_dir: Path) -> RolloutResult:
        self.calls.append(task_dir)
        return RolloutResult(
            transcript=f"fake trajectory for {task_dir.name}",
            reward=self.reward,
            outcome=self.outcome,
        )


def test_fake_agent_runner_satisfies_protocol():
    agent: AgentRunner = _FakeAgentRunner(outcome=True)
    assert isinstance(agent.run(FIXTURE), RolloutResult)


def test_run_baseline_produces_trajectory_records_with_real_provenance():
    agent = _FakeAgentRunner(outcome=False, reward=0.4)
    records = run_baseline([FIXTURE], agent)

    assert len(records) == 1
    record = records[0]
    assert isinstance(record, TrajectoryRecord)
    assert record.task_id == "encode__httpx-3367"
    assert record.outcome is False
    assert record.reward == 0.4
    assert "fake trajectory" in record.transcript
    # real provenance, parsed from the actual fixture, not stubbed
    assert record.provenance.repo == "encode/httpx"
    assert record.provenance.base_commit == "8e36f2bc685dfbe43cd7503bc1c422a6ed6e05a5"
    assert agent.calls == [FIXTURE]


def test_run_baseline_assigns_unique_trajectory_ids_across_repeated_tasks():
    """Same task run twice (e.g. temperature-sampled repeats for GRPO grouping)
    must get distinct trajectory_ids even though task_id repeats."""
    agent = _FakeAgentRunner(outcome=True)
    records = run_baseline([FIXTURE, FIXTURE], agent)
    assert records[0].task_id == records[1].task_id == "encode__httpx-3367"
    assert records[0].trajectory_id != records[1].trajectory_id
