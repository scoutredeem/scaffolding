---
name: flow-brief
description: 'Brief of one user journey for the change on the current branch, written to .flow/changes/<change-name>/brief.md.'
disable-model-invocation: true
user_invocable: true
---

**Brief** is the product record of one **journey** — one entry point, one goal, one continuous experience. It names what the user sees (a form, a field, a button, a list, a confirmation, a message) and what the user decides (the rule, the message text, the rejected alternative). How it lands is **blueprint**.

**Choice** — lettered options, each on its own line, recommendation marked, then wait. If a structured choice tool is available, use it.

```
A — archive: items can be restored within 30 days  [recommended]
B — delete: items are unrecoverable

Pick A or B (or describe another option). Wait.
```

**Change name** — the Linear issue's `gitBranchName` (`sco-3205-placement-api-catalogue`), set up by `/flow-prep`. It names the git branch and the **change folder** `.flow/changes/<change-name>/`.

Open only the current step's file. The step is locked when its completion criterion is met.

1. **Intake** — `steps/intake.md`
2. **Interview** — `steps/interview.md`
3. **Write** — `steps/output.md`

When Write is locked, list any journeys **Intake** split off as issues for me to file in Linear (title and one line each), then offer `/flow-build` or stop.
