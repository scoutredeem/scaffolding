# Write

Scan the draft for framework names, model names, route shapes, column names, and delivery-mechanic words (inline, toast, spinner, skeleton). Any hit is contamination — rewrite that line as what the user sees or decides, then scan again. `file_key`, `node_id`, `page_id`, and Figma URLs belong only in `design` frontmatter and `## Design references` — nowhere else in the brief.

Write `.flow/changes/<change-name>/brief.md` with this frontmatter and structure.

When Figma was supplied (see **Design** step), include the `design` block and `## Design references`. When the user said none, omit both.

```markdown
---
briefed: <YYYY-MM-DD>
design:
  source: figma
  figma_url: <canonical url>
  file_key: <key>
  design_mcp: available | unavailable
  anchors:
    - journey_step: "<step title from journey section>"
      page_id: "<id>"
      page_name: "<name>"
      node_id: "<id>"
      frame_name: "<name>"
---

# <Change Name> — Brief

## Entry point, user goal, status

[Where the user enters the journey, what they want to achieve, and the high-level status of this change (new / extension / fix).]

## Prerequisites

[Other product capabilities this depends on, as product relationships, not data shapes. Omit if none.]

## The journey, step by step

[Ordered narrative. Failure modes live at the step where they occur.]

## Design references

| Journey step | Page | Node ID | Frame |
|--------------|------|---------|-------|
| … | Settings (`12:34`) | `56:78` | Archive modal |

[Omit this section when `design.source` is absent. One row per anchor; `journey_step` matches the journey heading.]

## Decisions made

[Table with rejected alternatives and reasoning. Product decisions only.]

## Constraints the journey places on implementation

[Rules the implementation must honor, in product terms. What the constraint is. Validation rules and the exact user-facing messages live here; how those messages surface does not.]
```

`briefed:` is today's date (`YYYY-MM-DD`). Set it once, on first write; later writes leave it.

If the user chose append: new content that extends an already-documented journey step (a failure mode, a refinement) is edited into that step's narrative in place — per **interview.md**'s rule that failure modes attach to the step they occur on, not into a separate section. A new decision from this run is added as a new row in the existing `## Decisions made` table. A new constraint is added alongside the existing ones in `## Constraints the journey places on implementation`. Neither is restated in `## Follow-up`. Reserve `## Follow-up` for content that doesn't belong to any existing journey step — a genuinely new step, an open question.

Merge new **anchors** into `design.anchors` and the table when appending. An anchor whose `node_id` matches one already recorded updates that entry in place (never duplicated). Every anchor's `journey_step` matches an actual heading in `## The journey, step by step` — never a `## Follow-up` label standing in for one.

Ensure `.flow/tracker.yml` still has this change's `name` entry (idempotent — create only if missing).

Write is done when `brief.md` has every required section for this run (including `## Design references` when Figma was supplied), appended content lives in an existing step or in `## Follow-up` per the rule above, the contamination scan is clean, `briefed:` is set, and the tracker entry exists.
