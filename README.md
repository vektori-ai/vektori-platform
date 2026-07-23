# Vektori

Vektori ingests real agent execution traces and synthesizes RL environments from them: it
extracts scenarios, grades each one against an executable rubric, and surfaces the specific
capability gaps behind the failures, so training can target what's actually broken instead
of retraining everything.

## What's in this repo right now

This is the platform frontend, built against one real ingested trace (`src/data/run8.json`,
436 messages / 177 tool calls / 30M tokens) and the environment it produced
(`src/data/environment.json`, 29 scenarios extracted, 25 graded clean, 4 flagged and withheld
automatically by the verifier).

- **Overview** (`src/pages/Overview.tsx`) — summary of the ingested trace and what it
  produced: scenarios extracted, verifier checks, pass rate.
- **Environments** (`src/pages/EnvironmentDetail.tsx`, `ScenarioDetail.tsx`) — the synthesized
  environment, drilling into individual task packages and the rubric checks each one is
  graded against.
- **Runs** (`src/pages/RunsOverview.tsx`, `RunDetail.tsx`) — full transcript viewer for the
  ingested trace: every tool call, reasoning step, and result.
- **Train** (`src/pages/Train.tsx`) — the run configuration surface (capability deficit, base
  model, GRPO/PPO/DPO, LoRA) for training against a synthesized environment.

## What this is not, yet

There's no backend. Nothing here talks to GitHub, Notion, or an LLM at runtime — the app is a
frontend against static trace data. The Train tab has no training loop behind it. We're
validating the synthesis and evaluation loop first, then wiring in real ingestion and training
infrastructure.

## Stack

Vite + React 19 + TypeScript + Tailwind v4. `npm install && npm run dev`.
