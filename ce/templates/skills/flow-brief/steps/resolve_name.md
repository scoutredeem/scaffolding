# Name

Parse `$ARGUMENTS` as literal tokens. The first positional token maps to `.flow/changes/<change-name>/`. Resolve **tracker-first** against `.flow/tracker.yml`.

- _Omitted_ → **Choice** of 2–3 candidate names (Name convention). No seed. If you have no signal, ask one scoping question first, then propose.
- _Exact match on a tracker `name`_ → adopt it verbatim. The entry's one-line `description` is the interview seed.
- _Anything else_ → a seed, never the final name. A bare token is a proposed name: sanitize, surface the transformed name, confirm (yes/no). A phrase with spaces is an inline description: draft candidates from it (Name convention).

A tracker pointer is already canonical. Every other name is confirmed.

If `.flow/changes/<change-name>/brief.md` exists: **Choice** of overwrite, append, or a different name. Wait.

Once named, echo `Drafting brief for change=<name>`.

## Name convention

Lowercase kebab-case: `[a-z][a-z0-9]*(-[a-z0-9]+)*`. 2–5 words that name what the change touches. No `add-` / `update-` / `fix-` / `new-` / `remove-` prefixes.

Examples: `archived-categories`, `payment-retry-window`.

### Sanitization

1. Lowercase everything.
2. Replace spaces, underscores, dots, slashes, and any other non-alphanumeric character with hyphens.
3. Collapse consecutive hyphens into one.
4. Strip leading and trailing hyphens.
5. If the result is empty, a single character, or starts with a digit, ask again.
6. If a verb prefix is detected (`add-`, `update-`, `fix-`, `new-`, `remove-`), strip it and note: "dropped the `<prefix>-` prefix — name is the noun."

Surface the transformed name and confirm (yes/no). A rejected name re-enters sanitization.

Examples: `UserProfile` → `user-profile`; `update-user-profile` → `user-profile` (with prefix-drop note); `42-things` → ask again (must start with a letter).

## Persist

Create `.flow/changes/<change-name>/` if needed. We call that folder the **change folder**.

Ensure `.flow/tracker.yml` has an identity entry (`name` + one-line `description`). Idempotent on `name` — an existing entry is left untouched.

Name is done when the **change folder** exists, the **tracker** has this `name`, and the name is confirmed (or was a tracker pointer).
