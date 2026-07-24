"""Baseline rollouts over an envgen-generated task pool.

`generate_task_pool` wraps `envgen.pr_runtime.PRRuntimePipeline` directly —
real repo mining, needs Docker (bootstrap) + an LLM. `run_baseline` runs the
target model under test against each task and turns the result into a
`TrajectoryRecord` — the model-under-test is out of scope for this module,
hence `AgentRunner` being a pluggable protocol rather than a concrete client.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from vektori_backend.diagnosis.models import TrajectoryRecord
from vektori_backend.diagnosis.provenance import parse_task_provenance
from vektori_backend.envgen import (
    BootstrapResult,
    PipelineInput,
    PRRuntimeOptions,
    PRRuntimePipeline,
)
from vektori_backend.envgen.spec import AuthSpec, OutputSpec, RepoSpec


def generate_task_pool(
    repo: str,
    out_dir: Path,
    bootstrap: BootstrapResult,
    *,
    options: PRRuntimeOptions | None = None,
    org: str = "vektori",
) -> list[Path]:
    """Mine `repo`'s real PR history into sandbox-verified tasks under out_dir.

    Requires a `BootstrapResult` (Docker) — see `envgen.ensure_bootstrap()`.
    Returns the list of per-task directories written.
    """
    pipeline_input = PipelineInput(
        repo=RepoSpec(url=repo),
        output=OutputSpec(org=org),
        auth=AuthSpec(),
    )
    pipeline = PRRuntimePipeline(pipeline_input, options or PRRuntimeOptions(), bootstrap=bootstrap)
    pipeline.run(out_dir)
    return [p for p in sorted(out_dir.iterdir()) if p.is_dir() and (p / "task.toml").exists()]


@dataclass(slots=True)
class RolloutResult:
    """What running the target model against one task produces."""

    transcript: str  # τ_i — full agent trajectory
    reward: float  # r_i — graded reward for this attempt
    outcome: bool  # y_i — win/loss (typically reward >= some threshold, or task's own pass/fail)


class AgentRunner(Protocol):
    """The model-under-test. Out of scope here — real implementations shell out
    to Harbor (`harbor run -p <task_dir> -a <harness> -m <model>`) or similar."""

    def run(self, task_dir: Path) -> RolloutResult: ...


def run_baseline(task_dirs: list[Path], agent: AgentRunner) -> list[TrajectoryRecord]:
    """Run `agent` against every task and collect the (x_i, τ_i, r_i, y_i) dataset."""
    records: list[TrajectoryRecord] = []
    for task_dir in task_dirs:
        rollout = agent.run(task_dir)
        provenance = parse_task_provenance(task_dir)
        records.append(
            TrajectoryRecord(
                trajectory_id=str(uuid.uuid4()),
                task_id=task_dir.name,
                transcript=rollout.transcript,
                reward=rollout.reward,
                outcome=rollout.outcome,
                provenance=provenance,
            )
        )
    return records
