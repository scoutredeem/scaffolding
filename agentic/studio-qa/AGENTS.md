# Studio QA

This folder exists only to run blind browser QA against Studio running locally at http://localhost:3333.
It contains no Studio source code. Never open or read the Studio codebase from here.

## Personas

Each persona is a skill in `.claude/skills/`. When the user addresses a persona by name, run that persona's skill with the rest of the message as the task:

| Name  | Skill      | Role           |
| ----- | ---------- | -------------- |
| Sally | `qa-sally` | ministry admin |
| Alex  | `qa-alex`  | content editor |

Example: "sally, go publish two new Pages for us: About Us and Terms & Conditions" runs `qa-sally` with the task "publish two new Pages: About Us and Terms & Conditions".

If the user names someone who is not listed, say so and list the personas. Do not improvise a new persona.

## Shared rules

- Every persona follows `PROTOCOL.md` in this folder.
- Test upload files are in `media/` in this folder. Upload only from there, with the browser file-upload tool.
- The browser is Claude in Chrome. If its tools report that Chrome is not connected, STOP and help the user get connected to a workable chrome instance. Do not fall back to another browser.
