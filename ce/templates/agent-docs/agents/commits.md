# Commit Messages

## Prefix convention

Prefix each commit subject with one of:

- `revert:` reverts a previous commit
- `fix:` bug fix, bumps the PATCH release
- `feat:` add a new feature, bumps the MINOR release
- `increment:` functional improvement that is not a feat or a fix. Examples: remove a feature, add loading state, new screen layout, show popup once only
- `ops:` non-functional code changes needed to build or deploy the app. Avoid: build, chore, ci
- `qa:` non-functional changes to improve understanding and assurance. Avoid: test, docs
- `refactor:` non-functional changes that improve maintainability and efficiency. Examples: trim dead wood, move or rename file
- `steer:` changes related to context engineering and steering agents: workflow tweaks, context documentation

Mark breaking changes with an exclamation mark:

```
ops!: upgrade to kit v.3.0.0
```
