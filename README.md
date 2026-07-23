# Vektori

LyceFlow's platform for turning real agent failures into RL training environments.

## Vision

Frontier labs already buy RL environments to post-train their models — that market's proven.
The next buyer is enterprises: they run agents in production, don't want their data flowing
through a frontier model's API, and hit specific tasks those models fail at. As they move
those workloads onto open-weight/small models, they need those models trained on exactly the
failures that matter to them — continuously, without regressing on what already works.

Vektori is that loop, productized:

```
ingest traces → identify model deficits → generate synthetic RL envs → train LoRA adapters per deficit → route to the right adapter
```

One LoRA adapter per capability deficit, not a full retrain — so fixing a gap never touches,
and can't regress, what the base model already does well. A router picks the right adapter(s)
at inference time. Full methodology (deficit-scoring formulas, how the synthetic envs get
built): [`docs/DESIGN.md`](docs/DESIGN.md).

## What's in this repo

- **Overview** (`src/pages/Overview.tsx`) — summary of an ingested trace and the environment it
  produced: scenarios extracted, verifier checks, pass rate.
- **Environments** (`src/pages/EnvironmentDetail.tsx`, `ScenarioDetail.tsx`) — the synthesized
  environment, drilling into individual task packages and the rubric checks each one is graded
  against.
- **Runs** (`src/pages/RunsOverview.tsx`, `RunDetail.tsx`) — full transcript viewer: every tool
  call, reasoning step, and result from an ingested trace.
- **Train** (`src/pages/Train.tsx`) — the run configuration surface (capability deficit, base
  model, GRPO/PPO/DPO, LoRA) for training against a synthesized environment.
