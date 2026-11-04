---
name: flow-build
description: 'Build the brief of the change on the current branch, following the project patterns.'
disable-model-invocation: true
user_invocable: true
---

**Build** turns the **brief** into working code. The brief is the spec. The pattern docs say how the code should look.

## Brief

Parse `$ARGUMENTS` as literal tokens. The first token, if there is one, is a Linear issue id (`SCO-3205`) or a **change name**. Otherwise the current git branch is the **change name**. An issue id points to the folder in `.flow/changes/` whose name starts with the lowercased id and a hyphen (`sco-3205-`).

If `.flow/changes/<change-name>/brief.md` does not exist, stop: "No brief for `<token or branch>`. Run `/flow-brief` first."

Read `brief.md` and every other document in the **change folder**. Then echo `Building change=<change-name>`.

Brief is done when you have read `brief.md` in full.

## Patterns

Open `.flow/patterns/index.yml`. Work out which areas of the codebase this brief touches, then read the pattern doc for each one.

Patterns is done when you have read the doc for every area the brief touches, and you have named those areas.

## Build

Build the brief. Each step in `## The journey, step by step` and each rule in `## Constraints the journey places on implementation` must be handled in code, and the code must follow the patterns you read.

Build is done when every journey step and every constraint maps to code, and the project's tests pass.

## Report

- Change name and brief path
- Pattern docs you followed
- Each journey step and constraint, with where it is built
- Test result
- Next: `/flow-review`
