# Figma — brief intake only

Brief reads **structure** from Figma; **blueprint** and **build** own implementation detail.

## URL parsing

| URL shape | `file_key` | `node_id` |
|-----------|------------|-----------|
| `figma.com/design/:fileKey/...?node-id=X-Y` | `:fileKey` | `X-Y` → `X:Y` |
| `figma.com/file/:fileKey/...?node-id=X-Y` | `:fileKey` | `X-Y` → `X:Y` |
| `figma.com/design/:fileKey/branch/:branchKey/...` | `:branchKey` | from `node-id` param |

Always convert hyphens to colons in `node_id`.

File-only URL (no `node-id`): ask for the screen or frame link for this **journey** — do not guess.

## MCP

1. Authenticate `plugin-figma-figma` if tools are unavailable.
2. **`get_metadata`** on the entry `node_id`, or on the file root when orienting — page names, frame names, hierarchy, designer annotations.
3. **`get_screenshot`** only to disambiguate frame names — not to write UI from pixels.

`get_design_context` returns reference code — hold for **blueprint** / **build**, not **brief**.

## **Anchors**

Each anchor ties one **journey** step to a Figma frame:

- `page_id` — Figma page node id
- `page_name` — human page name
- `node_id` — frame or screen node id
- `frame_name` — human frame name
- `journey_step` — title from the brief journey (filled at Write)

Store the canonical `figma_url` the user supplied.
