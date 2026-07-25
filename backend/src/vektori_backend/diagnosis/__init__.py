"""TRACE stage 1 — contrastive capability diagnosis (docs/DESIGN.md)."""

from vektori_backend.diagnosis.labeling import LiteLLMLabeler, LLMLabeler
from vektori_backend.diagnosis.models import (
    CapabilityLabel,
    DeficitScore,
    Label,
    Provenance,
    TrajectoryRecord,
)
from vektori_backend.diagnosis.provenance import parse_task_provenance
from vektori_backend.diagnosis.rollouts import (
    AgentRunner,
    RolloutResult,
    generate_task_pool,
    run_baseline,
)
from vektori_backend.diagnosis.scoring import rank_deficits

__all__ = [
    "AgentRunner",
    "CapabilityLabel",
    "DeficitScore",
    "LLMLabeler",
    "Label",
    "LiteLLMLabeler",
    "Provenance",
    "RolloutResult",
    "TrajectoryRecord",
    "generate_task_pool",
    "parse_task_provenance",
    "rank_deficits",
    "run_baseline",
]
