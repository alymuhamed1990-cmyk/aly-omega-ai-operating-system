# Aly Omega AI Operating System

**Version 2.1.0 — Unified AI Operating System & Executive Intelligence Architecture**

Aly Omega is a modular, evidence-first operating architecture designed to coordinate specialist AI agents across executive work, intelligence, commercial activity, operations, quality assurance and continuous learning.

## What is now implemented

- **168-agent registry** across Core, Intelligence, Commercial, Operations, Quality, Learning and Executive domains.
- **Orchestrator reference engine** with staged execution and explicit task state.
- **ACP (Agent Communication Protocol)** contract for every inter-agent handoff.
- **Mandatory Validation Gate** between stages.
- **System-wide Quality Gates** covering evidence, constraints, contradictions, assumptions, confidence, risk and external commitments.
- **Red Team review** for material risk, low confidence and critical work.
- **Final Gatekeeper** before consequential/external output.
- **Learning Engine** for corrections, recurring failures, patterns and reviewable playbook changes.
- **Job-search evaluation framework** that evaluates industry, business model, functional fit, seniority, location/eligibility, current status, career value and only then recommendation.

## Operating flow

`INTAKE → CLASSIFICATION → INTELLIGENCE/SOURCING → PLANNING → QUOTATION → EXECUTION → QA → LEARNING → MEMORY`

Not every task requires quotation; the Orchestrator selects the applicable stages.

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`config/system.yaml`](config/system.yaml), [`schemas/acp.json`](schemas/acp.json), [`schemas/task.json`](schemas/task.json), and [`agents/REGISTRY.json`](agents/REGISTRY.json).

## Core principles

1. Evidence before confidence.
2. Facts, assumptions and interpretations remain separate.
3. No silent bypass of validation gates.
4. Agents are specialists; the Orchestrator owns routing and state.
5. High-impact work gets adversarial review.
6. External or consequential output requires final approval.
7. Learning proposes changes; policy does not silently mutate.
8. Human judgment remains the final authority for consequential decisions.

## Reference implementation

The `omega/` package contains a deliberately provider-neutral Python reference implementation. It can later be connected to model providers, search, GitHub, business data, travel suppliers, databases or other tools without changing the core contracts.

## Status

**Foundation implemented.** The repository is intentionally structured so the next phase can attach real agent executors, tool adapters, persistent state, observability and production workflows without rewriting the architecture.
