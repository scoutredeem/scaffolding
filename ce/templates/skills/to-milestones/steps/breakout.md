# Milestones breakout

Propose a default milestone breakout based on a reasonable dependency sequence, plus 2 alternatives at different granularities. For example:

- **Default (recommended):** 3 milestones — Core CRUD → Integrations layer → Public-facing additions
- **Alternative A — fewer/bigger:** 2 milestones — Foundation+CRUD+Integrations together → Public-facing
- **Alternative B — more/smaller:** 5–6 milestones — One per major feature

Each milestone must:

- Deliver visible, usable functionality the product user can see and test
- Be a self-contained working session for a coding agent
- Have clear dependencies (later milestones build on earlier ones)

Explain the tradeoff in plain language: fewer milestones = larger one-shot sessions, more risk per session, less control; more milestones = more checkpoints, slower overall, more context-switching.

Wait for me to pick the granularity.

After you have my answer, add the milestones as changes on the tracker.
