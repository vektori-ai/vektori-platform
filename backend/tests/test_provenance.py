"""Parses a REAL task pulled from repo2rlenv's published `pr_runtime` reference
dataset (AdithyaSK/repo2rlenv-pr-runtime on HF Hub) — grounds this in the
actual shape envgen.pr_runtime writes, not a guessed one."""

from __future__ import annotations

from pathlib import Path

from vektori_backend.diagnosis.provenance import parse_task_provenance

FIXTURE = Path(__file__).parent / "fixtures" / "encode__httpx-3367"


def test_parses_real_task_provenance():
    prov = parse_task_provenance(FIXTURE)
    assert prov.repo == "encode/httpx"
    assert prov.base_commit == "8e36f2bc685dfbe43cd7503bc1c422a6ed6e05a5"
    assert prov.pr_url == "https://github.com/encode/httpx/pull/3367"
    assert "httpx/_content.py" in prov.touched_files
