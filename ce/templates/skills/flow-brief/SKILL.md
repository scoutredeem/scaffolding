---
name: flow-brief
description: 'Brief of one user journey, written to .flow/changes/<change-name>/brief.md.'
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

Open only the current step's file. The step is locked when its completion criterion is met.

1. **Name** — `steps/resolve_name.md`
2. **Scope** — `steps/scope_check.md`
3. **Interview** — `steps/interview.md`
4. **Write** — `steps/output.md`
