"""Thin entrypoint wiring envgen (mine a repo's PR history) to diagnosis (name capability gaps).

Real end-to-end running needs Docker (bootstrap) + a model to baseline (local via
Ollama, or a paid API) — neither is wired up to run automatically yet. This is
scaffolding: the pieces below are callable directly once those are available.
"""

from __future__ import annotations

import argparse
import logging
import sys

logger = logging.getLogger("vektori_backend")


def cmd_generate(args: argparse.Namespace) -> int:
    """Mine `--repo`'s PR history into sandbox-verified tasks via envgen.pr_runtime."""
    raise SystemExit(
        "not wired up yet — needs Docker for bootstrap. "
        "See backend/src/vektori_backend/envgen/pr_runtime.py to call it directly."
    )


def cmd_diagnose(args: argparse.Namespace) -> int:
    """Run baseline rollouts + capability-gap labeling over a generated task pool."""
    raise SystemExit(
        "not wired up yet — needs a model to baseline against. "
        "See backend/src/vektori_backend/diagnosis/ to call the pieces directly."
    )


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(prog="vektori-backend")
    sub = parser.add_subparsers(dest="command", required=True)

    g = sub.add_parser("generate", help="mine a repo's PR history (envgen.pr_runtime)")
    g.add_argument("--repo", required=True)
    g.set_defaults(func=cmd_generate)

    d = sub.add_parser("diagnose", help="baseline + label capability gaps (diagnosis)")
    d.add_argument("--task-pool", required=True)
    d.set_defaults(func=cmd_diagnose)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
