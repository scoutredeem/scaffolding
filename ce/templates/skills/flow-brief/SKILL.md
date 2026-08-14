---
name: brief
description:
  'Interview the user about a change to the product until the user journey is fully resolved. Outputs a
  PM brief to .flow/changes/<change-name>/brief.md  Stack-agnostic — no technical
  planning.'
disable-model-invocation: true
user_invocable: true
---

Execute the following steps in order. Each steps's full instructions are in its own file
under `steps/`. Read the relevant step file at the start of each step and follow it. Do
not skip ahead — confirm each step is locked before moving to the next.

1. **Resolve the name of the change** — `steps/resolve_name.md` Capture the change name and
   creates a folder for it

2. **Scope check** — `steps/scope_check.md` Evaluate the scope and break into separate
   changes if needed

3. **Interview** — `steps/interview.md` Evaluate the scope and break into separate
   changes if needed

4. **Output** - `steps/output.md` Write the change brief to the change folder.
