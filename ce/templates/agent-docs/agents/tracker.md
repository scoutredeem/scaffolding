# Tracker

Planned and in-flight changes to this product are tracked in a yaml file that is located at `.flow/tracker.yml`

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

## Inferred progress status

A change can be in one of two states of progress:

- **in-flight** - there is a folder at `.flow/changes/<name>` that corresponds exactly to the change name
- **planned** - there is no `.flow/changes/<name>` folder and the change name has not landed
