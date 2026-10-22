# Tracker

Planned and in-flight changes to this product are tracked in a yaml file at `.flow/tracker.yml`. To track them somewhere else, replace this doc with one that defines the same operations.

## Example

```yaml
#
changes:
  - name: archived-categories
    description: Archive categories instead of deleting; restore within 30 days
    # track: brief
    # branch: sco-2753-ai-flow
    # capabilities: expenses

  - name: eslint-upgrade
    description: Upgrade ESLint to v9 with legacy config compatibility shims

  - name: payment-retry-window
    description: Retry failed card charges within a configurable window
```

## Change name

A change name is the entry's `name`. The change folder is `.flow/changes/<change-name>/`.

## Operations

Skills that use the tracker call these operations.

- **Look up** `<name>`: read `.flow/tracker.yml` and match the `changes` entry whose `name` equals `<name>` exactly. Its `description` is the one-line description. If the file or entry is missing, there is no entry.
- **Register** `<name>` with a one-line description: if Look up finds the entry, leave it as it is. Otherwise append `name` and `description` to `changes`, creating the file if it is missing.
- **Drop** `<name>`: do not edit the file. The entry stays as the change's record. It has landed once its change folder is in `.flow/archive/`.

## Inferred progress status

- **in-flight**: a folder at `.flow/changes/<name>` corresponds exactly to the change name.
- **planned**: the entry has no change folder in `.flow/changes/` or `.flow/archive/`.
- **landed**: the change folder has been archived to `.flow/archive/`.
