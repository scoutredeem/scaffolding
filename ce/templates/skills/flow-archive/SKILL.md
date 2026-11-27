---
name: flow-archive
description: 'Archive every merged change from .flow/changes/ into .flow/archive/.'
disable-model-invocation: true
user_invocable: true
---

**Archive** is mechanical and runs in batches: survey every **change** in `.flow/changes/`, read its PR from GitHub, and move each merged one into `.flow/archive/` unchanged. Changes still in flight stay where they are.

Parse `$ARGUMENTS` as literal tokens. Each token is a **change name** or a Linear issue id (`SCO-3205`, matching the folder that starts with `sco-3205-`). With tokens, survey only those changes. Without any, survey every folder in `.flow/changes/`.

## ARCHIVE PAUSED

The batch cannot proceed. Leave `.flow/changes/` as it is.

```
ARCHIVE PAUSED

What I need from you:
  <one specific question or decision>
```

Wait.

## Survey

Run `git fetch origin`. If `gh auth status` fails or there is no `origin` → ARCHIVE PAUSED.

The change name is also the git branch name. For each change folder, look up its PRs:

```
gh pr list --head <change-name> --state all --json number,url,state,mergedAt,mergeCommit,baseRefName,reviewDecision,latestReviews
```

Give each change exactly one status, based on its most recently merged PR, or else its newest PR:

- **merged**: the PR is merged, and `reviewDecision` is `APPROVED` or `latestReviews` holds an `APPROVED` review
- **unreviewed**: the PR is merged without an approval
- **in flight**: the PR is open, or the change has no PR
- **abandoned**: the PR is closed without being merged

Survey is done when every surveyed folder has a status. If none is **merged** or **unreviewed**, stop with "Nothing to archive", followed by the Report.

## Archive date

For each **merged** and **unreviewed** change, take the first date that applies, working down the list:

1. **production**: the date the PR's merge commit reached `origin/main`
2. **staging**: the date it reached `origin/staging`
3. **merged**: the PR's `mergedAt`
4. **today**

Skip any branch that does not exist on `origin`. A merge commit reaches a branch with the oldest commit on that branch's first-parent line that contains it. That commit's committer date, as `YYYY-MM-DD`, is the date:

```
git rev-list --first-parent --reverse --since=<mergedAt> origin/<branch> \
  | while read c; do git merge-base --is-ancestor <mergeCommit> "$c" && { git show -s --format=%cs "$c"; break; }; done
```

No output means the change has not reached that branch. Move on to the next item in the list.

Archive date is done when each change has a date and you know which item in the list it came from.

## Destination

A Linear prefix is a `<team>-<number>-` start to the change name: letters, a hyphen, digits, a hyphen (`sco-3205-`).

- With a Linear prefix, the date replaces it: `.flow/archive/<date>-<rest of change-name>/`.
- Without one, the date goes in front: `.flow/archive/<date>-<change-name>/`.

Examples:

- `.flow/changes/sco-3205-payment-retry-window/` → `.flow/archive/2026-03-15-payment-retry-window/`
- `.flow/changes/payment-retry-window/` → `.flow/archive/2026-03-15-payment-retry-window/`

A change is a **collision** when its path already exists, or another change in this batch has the same path. A collision stays in `.flow/changes/` and goes in the Report.

Destination is done when each change has a free path or is marked as a collision.

## Unreviewed

If any change is **unreviewed**, list them with their PR URLs. Ask once whether to archive all of them, some of them, or none. Wait. The ones I leave out stay in `.flow/changes/`.

Unreviewed is done when I have decided on each one.

## Move

Create `.flow/archive/` if needed. Move each **merged** change, plus each **unreviewed** one I approved, to its destination: every file, with its content unchanged. Use `git mv` for a tracked folder and `mv` for an untracked one. Leave the commit to me.

Move is done when every change to archive is at its destination and gone from `.flow/changes/`.

## Report

A table of every surveyed change: name, PR, status, and either the destination with its archive date and where the date came from (`production`, `staging`, `merged`, `today`), or why it stayed (in flight, abandoned, collision, unreviewed and left out).
