"""The analysis agent — labels ℓ_i^c for each (trajectory, capability) pair.

DESIGN.md: "For every rollout, an analysis agent labels each capability c per
trajectory i as whether it was needed and, if so, whether the agent actually
used it." Grounded in the task's provenance (touched files, PR url, base
commit) so the labels name real, codebase-specific gaps instead of generic
categories.
"""

from __future__ import annotations

import json
import re
from typing import Protocol

from vektori_backend.diagnosis.models import CapabilityLabel, Label, Provenance
from vektori_backend.envgen.llm import complete
from vektori_backend.envgen.spec import LLMSpec

_SYSTEM_PROMPT = """\
You are auditing an AI coding agent's attempt at a real software task, to
name which specific capability was missing when the attempt failed (or,
when it succeeded, confirm the capability was actually exercised).

You will be given the task's provenance (repo, touched files, the real PR
this task was mined from) and the agent's full trajectory (its reasoning,
tool calls, and final result). Name capabilities that are specific and
falsifiable — tied to what this codebase actually requires (e.g. "updates
the generated API client after a schema change", not "good coding skills").

For each candidate capability, output one of:
  NA       — not relevant to this task
  PRESENT  — relevant, and the trajectory shows it was exercised correctly
  LACKING  — relevant, but the trajectory shows it was needed and missing

Respond with ONLY a JSON object: {"capability_name": "NA"|"PRESENT"|"LACKING", ...}
"""


def _build_prompt(
    transcript: str, provenance: Provenance, candidate_capabilities: list[str]
) -> str:
    return (
        f"Repo: {provenance.repo}\n"
        f"Base commit: {provenance.base_commit}\n"
        f"Source PR: {provenance.pr_url}\n"
        f"Touched files: {', '.join(provenance.touched_files) or '(none recorded)'}\n\n"
        f"Candidate capabilities to label: {', '.join(candidate_capabilities)}\n\n"
        f"--- Trajectory ---\n{transcript}\n"
    )


def _parse_labels(raw: str, candidate_capabilities: list[str]) -> dict[str, Label]:
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError(f"labeling response contained no JSON object: {raw!r}")
    parsed = json.loads(match.group(0))
    out: dict[str, Label] = {}
    for cap in candidate_capabilities:
        value = parsed.get(cap, "NA")
        out[cap] = Label(value) if value in Label.__members__.values() else Label.NA
    return out


class LLMLabeler(Protocol):
    def label(
        self,
        trajectory_id: str,
        transcript: str,
        provenance: Provenance,
        candidate_capabilities: list[str],
    ) -> list[CapabilityLabel]: ...


class LiteLLMLabeler:
    """Real implementation — wraps envgen.llm.complete() directly, no reinvented client."""

    def __init__(self, llm: LLMSpec, *, max_tokens: int = 2048, temperature: float = 0.0):
        self.llm = llm
        self.max_tokens = max_tokens
        self.temperature = temperature

    def label(
        self,
        trajectory_id: str,
        transcript: str,
        provenance: Provenance,
        candidate_capabilities: list[str],
    ) -> list[CapabilityLabel]:
        response = complete(
            self.llm,
            system=_SYSTEM_PROMPT,
            user=_build_prompt(transcript, provenance, candidate_capabilities),
            max_tokens=self.max_tokens,
            temperature=self.temperature,
        )
        labels = _parse_labels(response.content, candidate_capabilities)
        return [
            CapabilityLabel(trajectory_id=trajectory_id, capability=cap, label=lab)
            for cap, lab in labels.items()
        ]
