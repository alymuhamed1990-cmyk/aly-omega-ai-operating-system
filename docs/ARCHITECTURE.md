# Aly Omega AI Operating System — Architecture

## Mission
A self-correcting, evidence-driven AI operating system for executive work, operations, commercial activity, research, writing, sourcing, decisions, and learning.

## Core flow
`INTAKE → CLASSIFICATION → INTELLIGENCE/SOURCING → PLANNING → EXECUTION → QA → LEARNING → MEMORY`

Commercial workflows may additionally use `QUOTATION → EXECUTION`.

## System layers
1. **Core** — identity, policies, task contract, memory, routing.
2. **Intelligence** — research, sourcing, analysis, verification, synthesis.
3. **Commercial** — suppliers, B2B, DMC, contracting, pricing, revenue opportunities.
4. **Operations** — booking, confirmation, handover, escalation, execution control.
5. **Quality** — validation gates, evidence checks, red-team review, final gatekeeper.
6. **Learning** — feedback, error taxonomy, pattern detection, playbook updates.
7. **Executive** — priorities, decision briefs, risk, financial/operational visibility.

## Orchestration principle
The Orchestrator owns routing and state, not domain expertise. Specialist agents execute bounded tasks and return structured ACP handoffs. Agents must not silently bypass validation gates.

## ACP handoff
Every inter-agent handoff uses:
- TASK
- CONTEXT
- EVIDENCE
- FINDINGS
- ASSUMPTIONS
- RISKS
- CONFIDENCE
- RECOMMENDATION
- DEPENDENCIES
- VALIDATION STATUS

## Quality model
Quality Gates are system-wide. They apply to research, analysis, recommendations, writing, operations, commercial work, suppliers, data, and decisions.

Required controls:
- source/evidence validation
- constraint validation
- contradiction detection
- assumption disclosure
- confidence calibration
- Red Team challenge when material risk exists
- Final Gatekeeper before external-facing or consequential output

## Job-search evaluation order
When evaluating jobs: `Industry → Business Model → Functional Fit → Seniority → Location/Eligibility → Current Status → Career Value → Recommendation`.

Job title alone is never sufficient.

## Operating rule
No agent is allowed to convert an assumption into a fact. Unknowns remain explicit until validated.
