"""Reads a generated task's `[metadata.repo2env]` block into a `Provenance`.

Matches the exact shape `envgen.pr_runtime` writes (see
`envgen/pr_runtime.py`'s `repo2env` dict + `envgen/emitter.py`): top-level
`repo`/`reference` (PR url), and `pr_runtime.base_commit`. Touched files
aren't itemized in repo2env (only a count under `reward_calibration`), so
they're parsed from `solution/patch.diff`'s `diff --git a/x b/x` headers.
"""

from __future__ import annotations

import re
import tomllib
from pathlib import Path

from vektori_backend.diagnosis.models import Provenance

_DIFF_GIT_RE = re.compile(r"^diff --git a/(\S+) b/(\S+)", re.MULTILINE)


def _touched_files(oracle_diff: str) -> list[str]:
    files: list[str] = []
    for match in _DIFF_GIT_RE.finditer(oracle_diff):
        a, b = match.group(1), match.group(2)
        files.append(b if b else a)
    return files


def parse_task_provenance(task_dir: Path) -> Provenance:
    """task_dir is one task's directory (containing task.toml + solution/patch.diff)."""
    data = tomllib.loads((task_dir / "task.toml").read_text())
    repo2env = data["metadata"]["repo2env"]

    oracle_diff_path = task_dir / "solution" / "patch.diff"
    oracle_diff = oracle_diff_path.read_text() if oracle_diff_path.exists() else ""

    pr_runtime_meta = repo2env.get("pr_runtime", {})
    return Provenance(
        repo=repo2env["repo"],
        base_commit=pr_runtime_meta.get("base_commit", repo2env.get("ref", "")),
        pr_url=repo2env.get("reference", pr_runtime_meta.get("pr_url", "")),
        touched_files=_touched_files(oracle_diff),
    )
