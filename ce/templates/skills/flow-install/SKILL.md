---
name: flow-install
description: 'Install CE Flow into a new or legacy project: the RC file, agent docs and pattern docs from the scaffold.'
disable-model-invocation: true
user_invocable: true
---

**Install** copies the project-level parts of CE Flow from the **scaffold** into the current project. It writes only these **targets**, and leaves them uncommitted:

| Target                                                  | Source, in the scaffold's `ce/templates/` |
| ------------------------------------------------------- | ----------------------------------------- |
| `AGENTS.md`                                             | `rc.md`                                   |
| `CLAUDE.md`                                             | the single line `@AGENTS.md`              |
| `docs/agents/commits.md`, `domain.md`                   | `agent-docs/agents/`                      |
| `docs/agents/audit.md`, filled in                       | `agent-docs/agents/audit.md`              |
| `.flow/patterns/`                                       | `profile/<profile>/patterns/`, every file except `.DS_Store` |

**Scaffold**: the git repo this skill lives in. Resolve the symlink to this skill's real folder; the templates are at `../../` from there.

**Profile**: the project's base tech stack. `$ARGUMENTS` may name it (`flutter` or `vita`). Otherwise detect it: `pubspec.yaml` → `flutter`; `package.json` depending on `@adonisjs/core` → `vita`. Neither or both → ask. Wait.

**Collision**: a target that already exists with different content. Show the unified diff from the existing file to the proposed one, then **Choice**: keep existing, replace, or merge. Wait. A target with identical content is `unchanged`.

- Merge for `AGENTS.md`: keep the existing file and append each template section it lacks.
- Merge for `CLAUDE.md`: move its content into `AGENTS.md` (itself a collision if that changes `AGENTS.md`), then make `CLAUDE.md` the single line `@AGENTS.md`.
- Merge for any other file: the template's structure with the existing file's project-specific values carried over.

**Choice**: lettered options, each on its own line, recommendation marked, then wait. If a structured choice tool is available, use it.

## Scaffold

Run `git -C <scaffold> pull --ff-only`. If it fails → INSTALL PAUSED.

Settle the **profile**.

Echo `Installing CE Flow from <scaffold>@<short sha> profile=<profile>`.

Scaffold is done when the scaffold is up to date and the profile is known.

## INSTALL PAUSED

Install cannot proceed. Leave the targets as they are.

```
INSTALL PAUSED

What I need from you:
  <one specific question or decision>
```

Wait.

## RC file

Write `AGENTS.md` from `rc.md`, and `CLAUDE.md` as the single line `@AGENTS.md`. Resolve each **collision**.

RC file is done when both files are written, `unchanged`, or kept by choice.

## Agent docs

Copy `commits.md` and `domain.md` into `docs/agents/`. Resolve each **collision**.

Agent docs is done when both files are written, `unchanged`, or kept.

## Audit file

The audit file `docs/agents/audit.md` drives `/health-audit`. Fill it from the template, taking each frontmatter value from `$ARGUMENTS` first, then from repo evidence:

- `name`: `package.json` / `pubspec.yaml` name, or the README title
- `gcp.*`, `firebase`: `.firebaserc`, `cloudbuild.yaml`, `.github/workflows/`, deploy scripts, `.env.example`
- `infra.dockerfile`: the Dockerfile's path, or empty when there is none
- `code.main_branch`: the `origin` default branch
- `code.commands`: the build, typecheck, lint and test scripts in `package.json`, or `flutter analyze` and `flutter test`

Then ask once, in a single message, for each of `linear.team`, `gcp.project`, `gcp.cloud_run` and `gcp.cloud_sql` still unknown, showing what you found for the others. "none" means an empty list. Wait. A value still unknown keeps its template placeholder. Resolve the **collision** if `audit.md` exists.

Audit file is done when `docs/agents/audit.md` is written, `unchanged`, or kept, and every placeholder left in it is noted for the Report.

## Pattern docs

If `profile/<profile>/patterns/` is missing or holds no pattern files, note it for the Report and Pattern docs is done.

Copy every file into `.flow/patterns/`, keeping subfolders. Resolve each **collision** per file.

Pattern docs is done when every source file is written, `unchanged`, or kept.

## Report

- Each target: `created`, `replaced`, `merged`, `kept` or `unchanged`
- Each `audit.md` value left as a placeholder, and where it could be found
- A profile with no pattern docs in the scaffold
- Suggested commit: `steer: install CE Flow`
- Next: `/flow-v1` for a new project, or `/flow-prep <issue id>` for a legacy one; `/health-audit` once `audit.md` has no placeholders
