## Agent skills

### Coding standards and patterns

Before generating or writing any code, look through `.flow/patterns/index.yml` to decide which area of the codebase the change would touch and read the referenced document.

### Changes

Each change is a Linear issue. Its change name is the issue's `gitBranchName` (`sco-3205-placement-api-catalogue`), which names both the git branch and the change folder `.flow/changes/<change-name>/`. `/flow-prep <issue id>` sets both up.

### Commits

This project follows a commit message standard to steer version numbering. See `docs/agents/commits.md`.

### Domain docs

This is a single-context project. See `docs/agents/domain.md`.
