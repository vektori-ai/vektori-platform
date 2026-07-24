"""Real end-to-end run: Docker (bootstrap) + a live model, against a real repo.

Explicitly NOT run as part of normal test runs — see pyproject.toml's
`addopts = "-m 'not integration'"`. Run manually once Docker + a model
(local via Ollama, or a paid API) are actually available:

    uv run pytest tests/test_e2e_integration.py -m integration -v -s

First real target is a local model via Ollama, not paid API credits — see
the plan doc / conversation this was built from.
"""

from __future__ import annotations

import shutil

import pytest

pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(not shutil.which("docker"), reason="docker not available"),
    pytest.mark.skipif(not shutil.which("gh"), reason="gh CLI not available"),
]


def test_full_loop_against_a_real_repo():
    """generate_task_pool() -> run_baseline() -> rank_deficits(), against a real repo.

    Not implemented yet — this is the placeholder for the first real run once
    Docker + a model are wired up. See diagnosis/rollouts.py + envgen/pr_runtime.py
    for the pieces this will call directly.
    """
    pytest.skip("not wired up yet — needs a real AgentRunner + LiteLLMLabeler run")
