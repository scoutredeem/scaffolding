---
name: flow-document
description: 'State of one capability — written from the codebase into docs/states/<capability>.md'
disable-model-invocation: true
user_invocable: true
---

**State** is the canonical behavior contract for one **capability** — current behavior only, no history of how it got there.

## Identify the capability name

Parse `$ARGUMENTS` as literal tokens.

First positional token = `<capability>`. Maps to `docs/states/<capability>.md`.
If `<capability>` is omitted, list every file in `docs/states/` plus the option for a new capability, then wait.

### New capability name

Skip this section if we already have a capability name.

Remind me what we are looking for by asking:

> A capability is a named, product-level slice of behavior the app exposes, e.g. `authentication` or `billing` — a short noun. What capability should we document?

### Sanitization

Apply this deterministic transform to the proposed capability name:

1. Lowercase everything.
2. Replace spaces, underscores, dots, slashes, and any non-alphanumeric character with hyphens.
3. Collapse multiple consecutive hyphens into one.
4. Strip leading and trailing hyphens.
5. If the result is empty, a single character, or starts with a digit, ask again — do not proceed with a malformed name.
6. If a verb prefix is detected (`add-`, `update-`, `fix-`, `new-`, `remove-`), strip it and note inline: "dropped the `<prefix>-` prefix per the name convention — name is the noun, not the verb."

Surface the transformed name and confirm before proceeding (single-step yes/no). On rejection, accept a different name — which re-enters sanitization.

## Inspect

Inspect only a confirmed name.

Read `CONTEXT.md` (and `CONTEXT-MAP.md` if it exists) so the **state** uses product language. Read `docs/adr/` entries that touch this capability. If any of these are missing, proceed silently.

Read `.flow/patterns/index.yml` and the docs it references for the areas this capability touches — that decides where to look. On Flutter, also open the folder under `lib/src/` that corresponds with the capability.

Gather **state** from unit or functional tests, models and entity relationships, and services and managers. If `docs/states/<capability>.md` exists, read it.

**State** lines look like:

- After a user requests a password reset, an email is sent to their registered email address with reset instructions
- A user can request a resend of the reset instruction message
- A torrent of resend requests is throttled with a 60 second delay

Inspect is done when every behavior encoded in those tests, models, and services for this capability is on the draft **state**, and every existing line in the state file (if any) is marked confirmed, revised, or removed against the code.

## Document

Write `docs/states/<capability>.md` (create it if needed) as the **state**:

```markdown
# <Capability>

- <what the product does now>
```

Document is done when every line of the draft **state** is in the file, every line in the file is encoded in the code, and the file describes only what the product does now.
