## Language

**Glossary**:
A key context file that define the product specific language so that briefings and state documentation can be more concise.
_Avoid_: DSL, language definitions, terminology

**Profile**:
A name representing a project's base tech stack, like `Flutter` or `VITA` (Vue, Inertia, TypeScript, Adonis)
_Avoid_: tech framework, base technology, stack

**RC File**:
The file that agents would automatically read when starting on a project. This would be `AGENTS.md`, `CLAUDE.md` or `GEMINI.md`
_Avoid_: AGENTS file, context file, agent readme file, cursorrules file

**Flow Skills**:
A set of folders that conform to the AI skill spec and has a name starting with `flow-`
_Avoid_: harness skills, workflow skills, process skills

**Pattern Docs**:
A set of markdown files that describe the architecture and code patterns of the product.
_Avoid_: standards docs (Agent OS term), scaffold docs, harness docs (Adonis Flow term), convention docs

**Change**:
One bounded piece of work, tracked as a Linear issue from proposal to completion. Its change name is the issue's `gitBranchName`, which also names the git branch and the change folder.
_Avoid_: ticket, story, feature branch

**Brief**:
The product-level plan half of the **Feature Track**. Stack-agnostic — captures the user journey step by step, the decisions made and why, and the constraints placed on implementation, never technical detail. Produced by `/brief`.
_Avoid_: PRD, spec, ticket

**Capability**:
A named, product-level slice of behavior the app exposes. The unit its long-lived behavior contract (**State**) is organized around. Capabilities outlive any single **change**.
_Avoid_: module, feature, domain, entity

**State**:
The long-lived, canonical behavior contract for one **capability** — current behavior only, with no history of how it got there.
_Avoid_: state machine, spec, requirements doc

**Archive**:
The mechanical step that files a fully-completed **change** into Flow's historical record, moved unchanged.

## Project Structure

A mature project with archived briefs and healthy state:

```
our-project/
├── CONTEXT.md                   # Product language — so briefs and state stay concise
├── AGENTS.md                    # RC file — agent entry point
├── CLAUDE.md                    # @AGENTS.md
├── docs/
│   ├── agents/                            # Written once during installation
│   │   └── domain.md                      # explains about CONTEXT.md and ADRs
│   ├── adr/                               # architectural decision records
│   │   ├── 0001-postgres-for-write-model.md
│   │   └── 0002-csv-import-idempotency.md
│   └── states/                            # Canonical behavior contracts
│       ├── categories.md                  # one file per capability
│       ├── expenses.md
│       └── team-settings.md
└── .flow/
    ├── changes/                           # In-flight work only
    │   ├── sco-3205-payment-retry-window/
    │   │   └── brief.md
    │   └── sco-3088-dark-mode/
    │       └── brief.md
    ├── archive/                           # Completed changes — moved unchanged from /changes
    │   ├── 2026-03-15-categories/
    │   │   └── brief.md
    │   └── 2026-06-10-devotion-bookmarks/
    │       └── brief.md
    └── patterns/                          # Coding standards
        ├── api/
        │   ├── response-format.md
        │   └── error-handling.md
        ├── database/
        │   └── migrations.md
        └── index.yml                      # Index for matching
```

## Parts

### Glossary

Where: `CONTEXT.md`
Version control: yes
Source: grill/brief skill artifact

### RC File

Where: `AGENTS.md`
Version control: yes
Source: scaffold/ce/templates/rc.md
Install script:

```bash
echo "@AGENTS.md" > CLAUDE.md
```

### Flow Skills

Where: `~/.agents/skills`
Version control: n/a
Source:

    - scaffold/ce/templates/skills
    - .cursor/skills/flow-build
    - .cursor/skills/flow-review

Install script:

    - clone/pull from scaffold
    - symlink them for claude `~/.claude/skills/`

`qa-persona` is not a skill (no `SKILL.md`) but the shared protocol for `qa-sally` and `qa-alex`. Symlink it alongside them, as a sibling, so their `../qa-persona/PROTOCOL.md` pointer resolves.
Runs that upload files need `qa-persona/media` connected to the chat as a folder; the browser upload tool rejects unshared paths.

As per the [Agents Skills Standard][2] the skills will be picked up automatically by cursor, codex, gemini, but not claude so we need to symlink into ~/.claude/skills/

### Pattern Docs

Where: `.flow/patterns`
Version control: yes
Source:

- scaffold/ce/templates/profile/vita/patterns
- scaffold/ce/templates/profile/flutter/patterns

Install script:

    - clone/pull from scaffold

## Pattern docs index

Build and patch using the `/flow-index-patterns` command similar to the `/agent-os:index-standards` command

Resolve in `/flow-blueprint` and others like this:

> Read `.flow/patterns/index.yml` to identify relevant patterns based on the change being built / briefed

## Process

### Prep (once, dev)

1. Scaffold a basic starter app and put it under version control (known vendor packages installed and third party services configured)
2. Install the flow scaffold into the project
3. Configure CI/CD with test commit and test deploy

### V1 (once, anyone)

Discover and document product scope and milestone list using `/v1`.

When the skill senses that all descision trees have been explored it offers to split the explored work into milestones, listed for you to file as Linear issues. A tired user can also snapshot the context with `/handoff` and/or explicitly trigger `/to-milestones` to wrap up the grilling session. Commits changes on main branch and pushes.

Key outputs (AGENTS.md, README.md, CONTEXT.md, ADRs, milestone list):

- product name
- what we're building: 1–3 sentence core purpose, expanded with a paragraph or two of context. End with a sentence on the tech stack and how the build is structured around milestones.
- what the product does: bulleted list of the high-level user-facing capabilities
- out of scope list
- list of milestones each with a name and short description

### Prep (anyone)

Set up a Linear issue as a change using `/flow-prep <issue id>`:

- Audits the change name (the issue's `gitBranchName`) and renames the issue when it breaks the naming convention
- Creates the change folder
- Creates or switches to the git branch

### Brief (anyone)

Produce a non-technical brief for the change on the current branch using `/flow-brief`:

- Reads the Linear issue and the change folder as the seed, and splits off extra journeys as issues for you to file
- Optionally gathers Figma design links and pre-reads frame structure before the interview
- Grills the user with docs on the milestone focussing on the desired behaviour (what the user does and sees)
- Writes a non-technical `brief.md` into the change folder
- Offers to stop or continue with `/flow-build`

### Build (dev, anyone)

Builds a brief to deliver a change using `/flow-build`:

- Interviews the user to pick any required vendor packages. Clarifies test seams and implementation tradeoffs etc.
- Builds a test for a tracer bullet implementation (test red)
- Implement tracer (test green)
- Write full test (test red)
- Implement full test (test green)
- Run test suite
- Commit changes and create a PR @V2
- Stops, but mention `/flow-review` as the next step

### Review (dev, anyone)

Spawns a code-standards review with `/code-review` and a FQA with `/fqa`

- Loop through review-and-fix till resolved @HMW
- Human signs off with `/ship-it` which does:
- Merge the PR @V2
- Tag a release @V2
- Update state docs using `/document` @V2

## Skills

1. `/flow-v1` - Scopes a fresh project and break into milestones
2. `/flow-prep` - Sets up a Linear issue as a change: name, folder and branch
3. `/flow-brief` - Specs out one change with a non-technical brief
4. `/flow-build` - Implement a change brief with tests
5. `/flow-review` - Review a build

- `/to-milestones`
- `/brief-from-design` — superseded by optional Figma intake in `/flow-brief`
- `/fqa`
- `/code-review`
- `/ship-it`
- `/document`
- `/flow-status`
- `/qa-sally` — blind browser QA on local Studio as Sally, a ministry admin (user-invoked; shares `qa-persona/PROTOCOL.md`)
- `/qa-alex` — blind browser QA on local Studio as Alex, a content editor (user-invoked; shares `qa-persona/PROTOCOL.md`)
