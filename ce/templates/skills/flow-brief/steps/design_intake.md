# Design

Ask once: _"Is there a Figma design for this **journey**? Paste a link, or say none."_ If appending to an existing `brief.md`, read its `design:` block first — a new link adds anchors to that same map; don't re-ask if the user already answered this question earlier in the run.

**None** → empty **design map**. Design is done.

**Link** → parse `file_key` and `node_id` per `references/figma.md`. File-only URL → ask for the frame link; wait.

Authenticate Figma MCP when tools are unavailable. On auth or fetch failure → record `figma_url` and `file_key` only, note `design_mcp: unavailable`, empty **design map**. Design is done.

With MCP:

1. **`get_metadata`** on the entry node (or file root to list pages, then the frame).
2. Build the **design map**: each in-scope frame → `page_id`, `page_name`, `node_id`, `frame_name`, and a draft `journey_step` label from frame name or annotation.
3. **`get_screenshot`** only when two or more frames could match the same step.

Multiple frames could own this **journey** → **Choice** which are in scope. Recommend the frame the name or annotation marks as current (e.g. not `old`/`deprecated`/a superseded version number) or the one matching behavior already confirmed in **Interview**. Neither signal present → no recommendation is honest; ask the user which is current instead of guessing. Wait.

Design is done when the user said none, or `figma_url` is recorded (with `file_key` when parseable), MCP failure is noted or **anchors** are identified, and the **design map** is ready for **Interview**.
