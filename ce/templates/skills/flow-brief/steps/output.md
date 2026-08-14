## Output

Before writing, scan the draft for framework names, model names, route shapes, column names, and delivery-mechanic words ("inline", "toast", "form field", "spinner", "skeleton"). Any hit means contamination — revise to product-level before writing the file.

Write to `.flow/changes/<change-name>/brief.md` with this exact frontmatter and section structure:

```markdown
---
briefed: <YYYY-MM-DD>
---

# <Change Name> — Brief

## Entry point, user goal, status

[Where the user enters the journey, what they want to achieve, and the high-level status of this change (new / extension / fix).]

## Prerequisites

[Other product capabilities this depends on, as product relationships, not data shapes. Omit if none.]

## The journey, step by step

[Ordered narrative. Failure modes live at the step where they occur.]

## Decisions made

[Table with rejected alternatives and reasoning. Product decisions only.]

## Constraints the journey places on implementation

[Rules the implementation must honor, in product terms. What the constraint is, never how to satisfy it. Validation rules and the exact user-facing messages live here; how those messages surface (inline, toast, page) does not.]
```

`briefed:` is today's date (`<YYYY-MM-DD>`) — it records when the journey was settled, so the lifecycle timeline can date the `briefed` stage. Set it once, on first write; do not rewrite it on later edits.

The output is a journey and the constraints it produces. The blueprint is a separate phase and gets to make its own technical choices freshly.

If `.flow/changes/<change-name>/` does not exist, create it before writing.
