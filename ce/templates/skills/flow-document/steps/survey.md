# Survey

The **survey** is read-only: it writes, renames and moves nothing. It ends in a report of which **states** the in-flight changes may have made stale, and which **capabilities** they introduce that have no **state** yet.

## Documented capabilities

List every `*.md` file in `docs/states/`. The file name without `.md` is the capability. Read each file, so you know what the capability covers as well as its name.

Read `CONTEXT.md` (and `CONTEXT-MAP.md` if it exists), when present, for the product language that links a brief to a capability.

If `docs/states/` is missing or empty, every capability a brief touches is new.

Documented capabilities is done when you hold every capability's name and its current state lines.

## Briefs

Read every `.flow/changes/*/brief.md`. Note the changes that have no `brief.md`, and leave them out of the survey.

For each brief, map every behavior it describes, meaning what the user does and sees and the rules it sets:

- **Affected**: the behavior adds to, changes, or removes a line in a documented capability, or falls inside what that capability covers. Be inclusive, since this list is the candidates for `/flow-document <capability>` to check against the code.
- **New**: the behavior fits no documented capability. Propose a capability name for it and apply the transform from **Sanitization** in `SKILL.md`. In a survey you propose the name without confirming it; when the transform leaves a malformed name, pick a different noun. Briefs that describe the same new slice of behavior share one name.

Briefs is done when every behavior in every brief is mapped to an affected or a new capability, with the brief lines that put it there.

## Report

```
Survey — <n> changes, <m> documented capabilities

Affected capabilities
- <capability>: <change-name> (<one line on what changed>), <change-name> (...)

New capabilities
- <proposed-name>: <change-name> (<one line on the behavior>), ...

Skipped (no brief): <change-name>, ...
```

Each list is ordered by how many changes touch it, most first. Write `none` under an empty list. Finish with the `/flow-document <capability>` command for each capability in both lists.
