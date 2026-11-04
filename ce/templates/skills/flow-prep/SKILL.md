---
name: flow-prep
description: 'Prepare a Linear issue as a change: audit its name, create the change folder, and switch to its git branch.'
disable-model-invocation: true
user_invocable: true
---

**Prep** is mechanical: fetch the issue, audit its name, create the **change folder**, switch to the branch. Any failed check is PREP PAUSED.

**Change name** — the issue's Linear `gitBranchName`, verbatim. `SCO-3205 Placement API Catalogue` → `sco-3205-placement-api-catalogue`. It names the git branch and the **change folder** `.flow/changes/<change-name>/`. Linear derives it from the issue title, so the title is where a name is fixed.

**Choice** — lettered options, each on its own line, recommendation marked, then wait. If a structured choice tool is available, use it.

## Issue

Parse `$ARGUMENTS` as literal tokens. First positional token = the Linear issue id (`SCO-3205`). If it is omitted, ask for it. Wait.

Fetch the issue with the Linear MCP `get_issue`: `identifier`, `title`, `gitBranchName`, `status`. If the Linear tools are unavailable or the issue is not found → PREP PAUSED.

Once fetched, echo `Preparing <identifier> change=<gitBranchName>`.

Issue is done when the issue is fetched and its `gitBranchName` is known.

## PREP PAUSED

Prep cannot proceed. Leave the issue, `.flow/changes/` and the git branch as they are.

```
PREP PAUSED — <issue id>

What I need from you:
  <one specific question or decision>
```

Wait.

## Name audit

The audited part is the `gitBranchName` after its `<team>-<number>-` prefix (`placement-api-catalogue`). It passes when it:

- is 2–5 words that name what the change touches
- has no `add-` / `update-` / `fix-` / `new-` / `remove-` prefix
- uses the domain terms in `CONTEXT.md`, not a synonym the glossary avoids

A name already in use is not renamed: if `.flow/changes/<change-name>/` exists, or a local or `origin` branch named `<change-name>` exists, note any audit failure for the Report and Name audit is done.

On a failure: **Choice** of 2–3 issue titles that pass, each shown with the `gitBranchName` it produces. Recommend one. Wait. Rename the issue to the chosen title with the Linear MCP `update_issue`, then fetch it again. If the new `gitBranchName` does not pass → PREP PAUSED.

Name audit is done when the name passes, or is in use and its failure is noted.

## Change folder

Create `.flow/changes/<change-name>/` if it does not exist. Leave any files already in it as they are.

Change folder is done when the folder exists.

## Branch

If the current branch is `<change-name>`, Branch is done.

If `git status --porcelain` shows uncommitted changes → PREP PAUSED: they would travel to the new branch.

- Local branch `<change-name>` exists → switch to it.
- Only `origin/<change-name>` exists → switch to it, tracking `origin`.
- Neither → create it from `develop` if `git rev-parse --verify develop` succeeds, otherwise from `main`, and switch to it.

Branch is done when the current branch is `<change-name>`.

## Report

- Issue id and title, and the rename if one was made
- Change name and **change folder** path
- Branch, and whether it was created or already existed
- Any name audit failure left in place
- Next: `/flow-brief`
