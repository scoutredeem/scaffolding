## Interview rules

- Walk the journey in order, entry point to completion using the `/domain-modeling` skill. Failure modes attach to the step they occur on — out-of-order recording loses the attachment.
- At each step, resolve: what the product user sees, what they can do, what state they're in, what happens on success, what happens on failure.
- Resolve each step concretely before advancing. Vague answers count as unanswered. A vague brief lets the build silently fill gaps I never agreed to.
- When a decision surfaces, name the alternatives, recommend one, record why. Rejected-alternatives + reasoning is what survives a tech-stack change. Example: `archive vs delete — archive chosen; users need to restore mis-archived rows within 30 days`.
- **Surface named alternatives as a multi-choice prompt.** List each option on its own line, mark the recommendation, pause for my reply before proceeding. If your environment offers a rich choice-input mechanism (such as a multi-select tool or structured form), use it; otherwise emit the choices as a lettered prose list. Does not apply to open-ended discovery questions where the answer space is not enumerable. Example floor:

  ```
  A — archive: items can be restored within 30 days  [recommended]
  B — delete: items are unrecoverable

  Pick A or B (or describe another option). Wait.
  ```

- Ask one question at a time. Batched questions collect partial answers; vague replies slip through unnoticed.
- If a question can be answered from the codebase, read instead of asking. Reading the codebase is not recording implementation — the brief still stays product-level.
- If whole journey is not clarified within 20 questions, offer to pause the interview.

## Tech-agnostic plan

The brief stays stack-agnostic so it survives a re-platform and blueprint inherits a clean, freshly-decidable surface. This is about what gets written down, not what gets discussed or looked up — reading the codebase is fine, recording implementation detail is not.

**The rule:** the brief names _what the user sees_ (a form, a field, a button, a list, a confirmation, a message) and _what the user decides_ (the rule, the message text, the rejected alternative at the user-experience level). The brief does not prescribe _how_ any of it lands — rendering location, timing, transition, retry strategy, data flow, state preservation, surfacing channel. Apply the rule to every delivery mechanic, including ones not on the list below.

Record only product behavior. The list below is illustrative — when a new mechanic appears (autosave cadence, optimistic UI, undo affordance, offline behavior, transitions), apply the rule, not the list.

Forbidden in the brief:

- Models, schemas, columns, indexes, foreign keys, migrations.
- Routes, HTTP verbs, URL shapes.
- Frameworks, libraries, rendering layers, client/server split.
- State management, caching, query strategies.
- File structure or language-specific concerns.
- UX delivery mechanics: where errors render (inline vs toast vs page), whether input is preserved on failure, retry affordances, focus management, loading indicators. These are blueprint-level presentation choices.

If I volunteer a technical detail, acknowledge and set aside. Example: _"Noted — Postgres JSON column. Holding for blueprint. Back to the journey: what does the user see after submit?"_

If a rejected alternative arrives at a "how" level, lift it to the "what" level if both alternatives are user-visible product shapes (e.g. "archived items in a separate tab vs filter-toggling the main list" — both are what the user sees, keep both). If the alternative is irreducibly "how" (e.g. "inline errors vs server-rendered error page"), defer comparison to blueprint and record only the product-level decision I made.

The line: product behavior is in scope, implementation is not. Some examples:

- ✅ "Names must be unique per team across active and archived categories."
- ❌ "Unique index on `(team_id, lower(name))`."

---

- ✅ "The archive confirmation shows the count of linked expenses."
- ❌ "Eager-load the count on the list query."

---

- ✅ "Amount must be greater than zero." (rule + message the user sees)
- ❌ "Form stays open with inline errors next to the offending field, input preserved." (delivery mechanic — blueprint decides)

When in doubt: would the user notice or care? If yes, it's product. If no, it's implementation — leave it out.
