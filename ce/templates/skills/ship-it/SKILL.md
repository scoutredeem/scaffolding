---
name: ship-it
description: Ship the current branch — commit check, push or publish, open a PR if none exists.
disable-model-invocation: true
---

Ship the local branch after a round of iteration: everything committed is on the remote, and a PR exists for it. Each step is idempotent — a branch that is already published with an open PR just gets its new commits pushed.

## 1. Check the tree

Read `git branch --show-current` and `git status --porcelain`.

- Detached HEAD, or on the repo's default branch (`gh repo view --json defaultBranchRef`) → stop and report; there is no branch to ship.
- Uncommitted or untracked changes → stop. Show the `git status --short` summary and ask whether to commit them first.
  - Yes → commit them, following the repo's commit-message convention (read `git log --oneline -10`).
  - No → ship the committed work only, and leave the changes in the tree.

**Done when:** the user has decided about every uncommitted change, and the commits to ship are final.

## 2. Push or publish

`git fetch origin`, then check for an upstream with `git rev-parse --abbrev-ref @{u}`.

- **Published** (upstream exists) → compare with `git rev-list --left-right --count @{u}...HEAD`:
  - Local ahead → `git push`.
  - Level → nothing to push.
  - Remote ahead or diverged → stop and ask; someone else's work is on the remote.
- **Unpublished** (no upstream) → `git push -u origin <branch>`.

**Done when:** `@{u}` and `HEAD` point at the same commit.

## 3. Open the PR

`gh pr view --json url,state,baseRefName`:

- Open PR → nothing to create; note its URL. If its title breaks the title convention below, fix it with `gh pr edit --title`.
- Merged or closed PR → stop and ask; new commits on a finished branch usually mean a new branch or a reopen, and that's the user's call.
- No PR → create one with `gh pr create --title <title> --body <body>`. Always pass `--title` explicitly; never let `gh` fill it from a commit message. Base is the default branch. Write the title and body from the commits in `<base>..HEAD` — the title names the change, the body says what changed and why. Fill the repo's PR template if one exists (`.github/pull_request_template.md` or `.github/PULL_REQUEST_TEMPLATE/`).

### PR title convention

CI validates the title with `amannn/action-semantic-pull-request`, and a bad title fails the build. The title must match:

```
<type>[(<scope>)][!]: <subject>
```

- `<type>` is exactly one of the types below, lowercase.
- `(<scope>)` is optional. `!` marks a breaking change.
- One colon, then one space, then a non-empty subject.
- No prefix before the type: no `[WIP]`, `WIP:`, `Draft:`, ticket IDs, or emoji. Put ticket references in the body.

| Type | Use for |
|---|---|
| `revert` | Reverts a previous commit |
| `fix` | Bug fix; bumps the PATCH release |
| `feat` | Adds a new feature; bumps the MINOR release |
| `increment` | Functional improvement that is not a feat or a fix |
| `ops` | Non-functional changes needed to build or deploy the app |
| `qa` | Non-functional changes that improve understanding and assurance |
| `refactor` | Non-functional changes that improve maintainability and efficiency |
| `steer` | Context engineering and steering agents: workflow tweaks, context documentation |

Conventional-commit types that habit suggests are not on the list and fail CI. Map them instead:

- `chore`, `build`, `ci`, `deps` → `ops`
- `test`, `docs` (for humans) → `qa`
- `docs` for agents (CLAUDE.md, AGENTS.md, skills, prompts) → `steer`
- `perf`, `style` → `refactor`

When the commits mix types, title the PR by the change that matters most to a reader of the release: `feat` over `fix` over `increment` over the non-functional types.

If the repo has its own semantic-PR workflow under `.github/workflows/` with a different `types:` list, that list wins.

Check the title against `^(revert|fix|feat|increment|ops|qa|refactor|steer)(\([^)]+\))?!?: \S.*$` before running `gh pr create`.

**Done when:** an open PR exists for the branch, its title passes the convention, and you have its URL.

## Report

- **Commits:** what was committed in step 1, if anything, and any changes left in the tree.
- **Push:** published, pushed (old → new SHA), or already level.
- **PR:** the URL and title, whether it was created this run or already existed, and whether the title was fixed.
