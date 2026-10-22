---
name: flow-close
description: 'Archive a completed change into .flow/archive/ and check where the tracker has it.'
disable-model-invocation: true
user_invocable: true
---

**Archive** is mechanical: confirm the gates, move the **change** folder unchanged, check the **tracker**. Any failed check is ARCHIVE PAUSED.

**Tracker** — where planned and in-flight changes are recorded, described by `docs/agents/tracker.md`. Archive only reads it, through that doc's **Drop** operation, and never creates, edits or deletes an entry.

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

Archive date is today as `YYYY-MM-DD`. Destination: `.flow/archive/<date>-<change-name>/`.

If that path already exists → ARCHIVE PAUSED: a name collision in the archive.

Destination is done when that path does not exist.

## Move

Create `.flow/archive/` if it does not exist. Move `.flow/changes/<change-name>/` to the destination — every file, content unchanged.

Move is done when the folder is at the destination and gone from `.flow/changes/`.

## Tracker

Run **Drop** for `<change-name>`. Note anything it says is left for me. If the doc or **Drop** is missing, note that instead.

The change folder is the **archive** record; moving it is the only mutation.

Tracker is done when **Drop** has run, or its absence is noted.

## Report

- Change name
- Destination path
- What the **tracker** left for me to do, if anything
- The **change** is filed; `.flow/changes/` holds only in-flight work
