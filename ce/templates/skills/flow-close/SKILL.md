---
name: flow-close
description: 'Archive a completed change into .flow/archive/.'
disable-model-invocation: true
user_invocable: true
---

**Archive** is mechanical: confirm the gates, move the **change** folder unchanged. Any failed check is ARCHIVE PAUSED.

## Identify the change

Parse `$ARGUMENTS` as literal tokens. First positional token = `<change-name>`.

If `<change-name>` is omitted:

1. List directories under `.flow/changes/` that contain `brief.md`.
2. If the list is non-empty: ask which to archive, then wait.
3. If empty: stop — "No changes ready to archive."

Once named, echo `Archiving change=<name>`. Identify is done when `.flow/changes/<change-name>/brief.md` exists. If the folder or `brief.md` is absent → ARCHIVE PAUSED.

## ARCHIVE PAUSED

The **archive** cannot proceed. Leave `.flow/changes/` as it is.

```
ARCHIVE PAUSED — <change-name>

What I need from you:
  <one specific question or decision>
```

Wait.

## Gates

Ask me to confirm:

- the PR for this change is merged
- **state** is current for every capability this change touched, or this change touched none

If I do not confirm both → ARCHIVE PAUSED.

Gates are done when I have confirmed both.

## Destination

Archive date is today as `YYYY-MM-DD`. A Linear prefix is a `<team>-<number>-` start to `<change-name>`: letters, a hyphen, digits, a hyphen (`sco-3205-`).

- With a Linear prefix → the date replaces it: `.flow/archive/<date>-<rest of change-name>/`.
- Without one → the date is prepended: `.flow/archive/<date>-<change-name>/`.

Examples:

- `.flow/changes/sco-3205-payment-retry-window/` → `.flow/archive/2026-03-15-payment-retry-window/`
- `.flow/changes/payment-retry-window/` → `.flow/archive/2026-03-15-payment-retry-window/`

If that path already exists → ARCHIVE PAUSED: a name collision in the archive.

Destination is done when that path does not exist.

## Move

Create `.flow/archive/` if it does not exist. Move `.flow/changes/<change-name>/` to the destination — every file, content unchanged.

Move is done when the folder is at the destination and gone from `.flow/changes/`.

## Report

- Change name
- Destination path
- The **change** is filed; `.flow/changes/` holds only in-flight work
