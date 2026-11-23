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
│   │   ├── commits.md                     # commit prefixes that steer version numbering
│   │   ├── domain.md                      # explains about CONTEXT.md and ADRs
│   │   └── audit.md                       # ids and thresholds for /health-audit
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
    ├── audits/                            # Dated /health-audit reports
    │   └── 2026-11-18.md
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
Source: scaffold/ce/templates/skills

Install script:

    - clone/pull from scaffold
    - symlink them for claude `~/.claude/skills/`

As per the [Agents Skills Standard][2] the skills will be picked up automatically by cursor, codex, gemini, but not claude so we need to symlink into ~/.claude/skills/

### Audit File

Where: `docs/agents/audit.md`
Version control: yes
Source: scaffold/ce/templates/agent-docs/agents/audit.md
Install script:

    - copy the template and fill in the Linear team, GCP project, Cloud Run services and Cloud SQL instances

### Pattern Docs

Where: `.flow/patterns`
Version control: yes
Source:

- scaffold/ce/templates/profile/vita/patterns
- scaffold/ce/templates/profile/flutter/patterns

Install script:

    - clone/pull from scaffold

## Pattern docs index

Resolve in `/flow-review` and others like this:

> Read `.flow/patterns/index.yml` to identify relevant patterns based on the change being built / briefed

## Process

### Install (once, dev)

Install the flow scaffold into a new or existing project with `/flow-install` (Flow Skills are installed globally, once per machine)

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

### Build (anyone)

Builds a brief to deliver a change using `/flow-build`

### Review (dev, anyone)

Spawns a code-standards review and change spec review with `/flow-review`

## Skills

1. `/flow-install` - Installs the RC file, agent docs and pattern docs into a new or legacy project
2. `/flow-prep` - Sets up a Linear issue as a change: name, folder and branch
3. `/flow-brief` - Specs out one change with a non-technical brief
4. `/flow-build` - Implement a change brief with tests
5. `/flow-review` - Review a build

- `/ship-it` — push the branch and open a PR with a CI-valid semantic title
- `/health-audit` — periodic read-only security/health audit driven by `docs/agents/audit.md`; writes `.flow/audits/<date>.md` and proposes Linear Triage issues
- `/to-milestones`
- `/domain-modeling` — maintain `CONTEXT.md` and ADRs; model-invoked, reached by `/flow-brief`'s interview. downstream from [Matt Pocock][1]

[1]: https://github.com/mattpocock/skills/tree/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/domain-modeling
