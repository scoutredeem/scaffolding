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
One bounded piece of work tracked from proposal to completion.
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

**Tracker**:
A registry of proposed and in-flight **changes**
_Avoid_: backlog, kanban, board

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
│   │   ├── tracker.md                     # tracker conventions
│   │   └── domain.md                      # explains about CONTEXT.md and ADRs
│   ├── adr/                               # architectural decision records
│   │   ├── 0001-postgres-for-write-model.md
│   │   └── 0002-csv-import-idempotency.md
│   └── states/                            # Canonical behavior contracts
│       ├── categories.md                  # one file per capability
│       ├── expenses.md
│       └── team-settings.md
└── .flow/
    ├── tracker.yml                        # Planned and in-flight change tracker
    ├── changes/                           # In-flight work only
    │   ├── payment-retry-window/
    │   │   └── brief.md
    │   └── dark-mode/
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

When the skill senses that all descision trees have been explored it offers to split the explored work to the **tracker** as milestones. A tired user can also snapshot the context with `/handoff` and/or explicitly trigger `/to-milestones` to wrap up the grilling session. Commits changes on main branch and pushes.

Key outputs (AGENTS.md, README.md, CONTEXT.md, ADRs, milestone list):

- product name
- what we're building: 1–3 sentence core purpose, expanded with a paragraph or two of context. End with a sentence on the tech stack and how the build is structured around milestones.
- what the product does: bulleted list of the high-level user-facing capabilities
- out of scope list
- list of milestones each with a name and short description

### Brief (anyone)

Produce a non-technical brief for a new change using `/flow-brief`:

- Picks an unspecced milestone from the **tracker** and turns it into a well-named change or creates a new well-named change on the **tracker**.
- Query the correct branch name and update the tracker. @V2
- Determines if this brief is steered by design and hands off to `/brief-from-design` @HMW
- Otherwise grill the user with docs on the milestone focussing on the desired behaviour (what the user does and sees)
- Creates a change folder containing a non-technical `brief.md`.
- Updates the **tracker**
- Offers to stop or continue with `/flow-build`

### Build (dev, anyone)

Builds a brief to deliver a change using `/flow-build`:

- Interviews the user to pick any required vendor packages. Clarifies test seams and implementation tradeoffs etc.
- create/switch to the branch @V2
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
- Removes the change from the **tracker**
- Merge the PR @V2
- Tag a release @V2
- Update state docs using `/document` @V2

## Skills

1. `/flow-v1` - Scopes a fresh project and break into milestones
2. `/flow-brief` - Specs out one change with a non-technical brief
3. `/flow-build` - Implement a change brief with tests
4. `/flow-review` - Review a build

- `/to-milestones`
- `/brief-from-design`
- `/fqa`
- `/code-review`
- `/ship-it`
- `/document`
- `/flow-status`
