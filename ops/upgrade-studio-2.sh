#!/usr/bin/env bash
# Copy selected top-level trees from this repo into another checkout (target repo).
# Requires rsync on PATH.
# Usage: _meta/upgrade.sh /path/to/target-repo
#   Folders: each path is mirrored under the same relative path in the target repo
#   (--delete removes extra files under those dirs). Files: single repo-root files are
#   copied to the same relative path in the target.

set -euo pipefail

# --- configuration (paths relative to this repository root) ---
COPY_FOLDERS=(
  app/controllers
  app/models
  app/services
  app/validators
  database/factories
  database/migrations
  ops
  resources
  start/routes
  tests
)

# Repo-root files (or any path to a regular file under the repo root).
COPY_ROOT_FILES=(
    config/analytics.ts
    config/cms.ts
    config/providers.ts
    inertia/css/app.css
    start/env.ts
    start/routes.ts
    .cursorignore
    .dockerignore
    .editorconfig
    .env
    .env.example
    .env.test
    .gcloudignore
    .gitignore
    .prettierrc
    compose.yaml
    Dockerfile
    postcss.config.js
    README.md
    tailwind.config.js
)
# --- end configuration ---

usage() {
  echo "Usage: $(basename "$0") <target-repo-path>" >&2
  echo "  Mirrors COPY_FOLDERS and COPY_ROOT_FILES from SOURCE into TARGET." >&2
  exit 1
}

[[ "${1:-}" ]] || usage

if [[ ! -d "$1" ]]; then
  echo "error: target folder does not exist (or is not a directory): $1" >&2
  exit 1
fi

target_root="$(cd "$1" && pwd)"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source_root="$(cd "$script_dir/.." && pwd)"

for rel in "${COPY_FOLDERS[@]}"; do
  [[ -n "$rel" ]] || continue

  source_dir="$source_root/$rel"
  dest_dir="$target_root/$rel"

  if [[ ! -d "$source_dir" ]]; then
    echo "warning: skipping missing source directory: $source_dir" >&2
    continue
  fi

  mkdir -p "$dest_dir"
  rsync -a --delete "$source_dir/" "$dest_dir/"

  echo "Copied $source_dir -> $dest_dir"
done

for rel in "${COPY_ROOT_FILES[@]}"; do
  [[ -n "$rel" ]] || continue

  source_path="$source_root/$rel"
  dest_path="$target_root/$rel"

  if [[ ! -f "$source_path" ]]; then
    echo "warning: skipping missing source file (or not a regular file): $source_path" >&2
    continue
  fi

  mkdir -p "$(dirname "$dest_path")"
  rsync -a "$source_path" "$dest_path"

  echo "Copied $source_path -> $dest_path"
done

