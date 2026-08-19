# Interview

Read `CONTEXT.md` for vocabulary (and `CONTEXT-MAP.md` if it exists). When a term is coined, conflicts with the glossary, or a hard-to-reverse trade-off appears, use the **domain-modeling** skill.

Walk the **journey** in order, entry point to completion. At each step, resolve: what the user sees, what they can do, what state they are in, success, and failure. Failure modes attach to the step they occur on. A step is resolved before the next is opened. A vague answer is still open.

When a decision surfaces, name the alternatives as a **Choice**, recommend one, record why. Example: `archive vs delete — archive chosen; users need to restore mis-archived rows within 30 days`.

Ask one question at a time.

If the codebase answers the question, read it instead of asking. Reading informs the question; only product behavior is written down.

If a technical detail is volunteered, acknowledge and hold for **blueprint**. Example: _"Noted — Postgres JSON column. Holding for blueprint. Back to the journey: what does the user see after submit?"_

If a rejected alternative is user-visible on both sides (archived items in a separate tab vs a filter on the main list), keep both at the experience level. If the fork is only a delivery mechanic, record the product decision and leave the comparison to **blueprint**.

If the journey is not settled within 20 questions, offer to pause.

## Product language

Apply **Brief** to every delivery mechanic — including ones not listed here.

Calibration:

- Names must be unique per team across active and archived categories. / not a unique index on `(team_id, lower(name))`.
- The archive confirmation shows the count of linked expenses. / not eager-load the count on the list query.
- Amount must be greater than zero (rule + message). / not form stays open with inline errors, input preserved.

Would the user notice or care? If yes, it is product. If no, hold it for **blueprint**.

Interview is done when every step of the **journey** has see / do / state / success / failure resolved, every **Choice** is recorded with rejected alternatives and why, and no vague answer is standing.
