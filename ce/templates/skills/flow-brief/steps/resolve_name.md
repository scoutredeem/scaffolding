# Resolve change name

Parse `$ARGUMENTS` as literal tokens, then resolve them _tracker-first_ against `.flow/tracker.yml`. The first positional token maps to `.flow/changes/<change-name>/`.

- _Omitted_ → run the candidate-proposal flow (see Name convention). No seed.
- _A bare token that exactly matches an entry `name` in `.flow/tracker.yml`_ → a tracker pointer. Adopt that `name` verbatim — it is already canonical, so skip the sanitizer — and read the entry's one-line `description` as the opening seed (the signal the interview consumes in place of the scoping question).
- _Anything else_ → a seed, never a final answer. A bare token is a proposed name: run it through the sanitizer (see Name convention), surface the transformed name, confirm. A phrase with spaces is an inline description: draft candidate names from it (see Name convention).

The resolved argument only seeds the brief's opening — it never shortcuts the journey interview, and a name is always confirmed, never lifted raw from prose.

- If `.flow/changes/<change-name>/brief.md` already exists: ask whether to overwrite, append, or pick a different name. Wait.

First action: echo `Drafting brief for change=<name>`.

## Name convention

Change folder names follow lowercase-kebab-case: `[a-z][a-z0-9]*(-[a-z0-9]+)*`. Lowercase letters, digits, single hyphens separating words. No underscores, spaces, uppercase, dots, slashes. No leading or trailing hyphens, no doubled hyphens. Starts with a letter, not a digit. Short and content-bearing: 2–5 words, no `add-` / `update-` / `fix-` / `new-` / `remove-` prefixes — the folder name describes what the change touches, not how.

Examples: ✅ `archived-categories`, ✅ `payment-retry-window`. ❌ `add-archived-categories`, ❌ `UserProfile`, ❌ `user_profile`.

### Candidate proposal (when `<change-name>` is omitted)

Draft 2–3 candidate names from what you know — the user's first message, the inline task description, the early scoping conversation — and surface them via the choice-presentation contract:

- List each candidate on its own line, mark the recommendation, pause for the user's reply before proceeding.
- If your environment offers a rich choice-input mechanism (such as a multi-select tool or structured form), use it; otherwise emit the choices as a lettered prose list.
- Example floor:

  ```
  A — archived-categories: scopes the feature surface  [recommended]
  B — category-archive: alternative noun ordering
  C — supply your own

  Pick A, B, C, or describe another option. Wait.
  ```

If you have no signal yet (the user invoked the skill with no description and no prior context), ask one scoping question first ("In one sentence, what is this change about?"), then propose from the answer.

A user-supplied name (option C, or any free-form reply) re-enters sanitization.

### Sanitization (when `<change-name>` is supplied)

Apply this deterministic transform:

1. Lowercase everything.
2. Replace spaces, underscores, dots, slashes, and any non-alphanumeric character with hyphens.
3. Collapse multiple consecutive hyphens into one.
4. Strip leading and trailing hyphens.
5. If the result is empty, a single character, or starts with a digit, ask again — do not proceed with a malformed name.
6. If a verb prefix is detected (`add-`, `update-`, `fix-`, `new-`, `remove-`), strip it and note inline: "dropped the `<prefix>-` prefix per the name convention — name is the noun, not the verb."

Surface the transformed name and confirm before creating the folder (single-step yes/no, not a multi-choice prompt). On rejection, accept a different name — which re-enters sanitization.

Examples:

- `UserProfile` → `user-profile` (confirm).
- `User_Profile` → `user-profile` (confirm).
- `update-user-profile` → `user-profile` (with prefix-drop note).
- `Add User Profile!` → `user-profile` (with prefix-drop note).
- `profile/v2` → `profile-v2` (confirm).
- `42-things` → ask again ("name must start with a letter").

## Persist the name

We refer to the folder at `.flow/changes/<change-name>/` as the **change folder**. If it does not exist yet, create it now.
Ensure `.flow/tracker.yml` has an entry for this change — identity only (`name` and a one-line `description`), idempotent on `name`. If an entry already exists, leave it untouched.
