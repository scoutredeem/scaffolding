# Prep

**Choice** whether this run continues into the briefing. No recommendation — the user is the readiness signal. Name files already in the **change folder** when presenting. A Figma URL already in the folder, or a `design:` block in `brief.md`, is the answer — confirm it (a new link adds anchors to that map).

A — continue: paste a Figma link, or say none
B — intake: paste notes or point at files, then park
C — park: stop; notes can be added in the change folder later

Wait.

**Intake** — wait for the notes. Write pasted text to `prep.md` (append if it exists). Files they placed in the folder stay as they are. Then park.

**Park** — stop this run. Echo `.flow/changes/<change-name>/` and that `/flow-brief <name>` resumes.

**Continue** — gather the **design map**. If this turn still has no link and no none, ask once: _"Is there a Figma design for this **journey**? Paste a link, or say none."_ If the user already answered earlier in this run, proceed with that answer.

**None** → empty **design map**. Prep is done.

**Link** → parse `file_key` and `node_id` per `references/figma.md`. File-only URL → ask for the frame link; wait.

Authenticate Figma MCP when tools are unavailable. On auth or fetch failure → record `figma_url` and `file_key` only, note `design_mcp: unavailable`, empty **design map**. Prep is done.

With MCP:

1. **`get_metadata`** on the entry node (or file root to list pages, then the frame).
2. Build the **design map**: each in-scope frame → `page_id`, `page_name`, `node_id`, `frame_name`, and a draft `journey_step` label from frame name or annotation.
3. **`get_screenshot`** only when two or more frames could match the same step.

Multiple frames could own this **journey** → **Choice** which are in scope. Recommend the frame the name or annotation marks as current (e.g. not `old`/`deprecated`/a superseded version number) or the one matching behavior already in `brief.md`. Neither signal present → no recommendation is honest; ask which is current. Wait.

Prep is done when this run is parked and any notes from this turn are in the **change folder**, or the user chose continue and the **design map** is ready — empty on none or MCP failure, otherwise `figma_url` recorded (`file_key` when parseable) and **anchors** identified.
