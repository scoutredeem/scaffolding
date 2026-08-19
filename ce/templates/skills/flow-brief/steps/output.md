# Write

Scan the draft for framework names, model names, route shapes, column names, and delivery-mechanic words (inline, toast, spinner, skeleton). Any hit is contamination — rewrite that line as what the user sees or decides, then scan again.

Write `.flow/changes/<change-name>/brief.md` with this frontmatter and structure:

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

[Rules the implementation must honor, in product terms. What the constraint is. Validation rules and the exact user-facing messages live here; how those messages surface does not.]
```

`briefed:` is today's date (`YYYY-MM-DD`). Set it once, on first write; later writes leave it. If the user chose append, keep the existing sections and add `## Follow-up` rather than replacing the file.

Write is done when `brief.md` has every required section, the contamination scan is clean, and `briefed:` is set.
