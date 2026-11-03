# Intake

## Change

Parse `$ARGUMENTS` as literal tokens. The first positional token, if present, is a Linear issue id (`SCO-3205`) or a **change name**. Otherwise the current git branch is the **change name**. An issue id resolves to the folder in `.flow/changes/` whose name starts with the lowercased id and a hyphen (`sco-3205-`).

If `.flow/changes/<change-name>/` does not exist, stop: "No change folder for `<token or branch>` — run `/flow-prep <issue id>` first."

The issue id is the **change name**'s `<team>-<number>` prefix, uppercased. Fetch the issue with the Linear MCP `get_issue`: `title`, `description`, attachments. If the Linear tools are unavailable, ask me to paste the issue title and description. Wait.

If `.flow/changes/<change-name>/brief.md` exists: **Choice** of overwrite or append. Wait.

Once read, echo `Drafting brief for change=<change-name>`.

## Seed

The issue title and description, and any other documents in the **change folder**, are the seed. Name each one. They stay draft until **Interview** confirms them.

## Scope

A **journey** is one entry point, one goal, one continuous user experience.

If the seed spans multiple journeys: propose a breakdown with a one-line title per piece, in the domain terms of `CONTEXT.md`. **Choice** which journey this issue keeps. Wait. This run briefs only that journey. Hold the others for the end of the run, as issues for me to file in Linear.

## Design

A Figma URL in the issue description or attachments, in a **change folder** document, or a `design:` block in `brief.md` is the answer — confirm it (a new link adds anchors to that map). Otherwise ask once: _"Is there a Figma design for this **journey**? Paste a link, or say none."_ Wait.

**None** → empty **design map**.

**Link** → parse `file_key` and `node_id` per `references/figma.md`. File-only URL → ask for the frame link; wait.

Authenticate Figma MCP when tools are unavailable. On auth or fetch failure → record `figma_url` and `file_key` only, note `design_mcp: unavailable`, empty **design map**.

With MCP:

1. **`get_metadata`** on the entry node (or file root to list pages, then the frame).
2. Build the **design map**: each in-scope frame → `page_id`, `page_name`, `node_id`, `frame_name`, and a draft `journey_step` label from frame name or annotation.
3. **`get_screenshot`** only when two or more frames could match the same step.

Multiple frames could own this **journey** → **Choice** which are in scope. Recommend the frame the name or annotation marks as current (e.g. not `old`/`deprecated`/a superseded version number) or the one matching behavior already in `brief.md`. Neither signal present → no recommendation is honest; ask which is current. Wait.

Intake is done when the **change folder** exists, the issue is read, overwrite or append is chosen for an existing `brief.md`, this run is one **journey**, and the **design map** is ready — empty on none or MCP failure, otherwise `figma_url` recorded (`file_key` when parseable) and **anchors** identified.
