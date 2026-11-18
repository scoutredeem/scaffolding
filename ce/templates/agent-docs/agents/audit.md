---
# Read by /health-audit. Holds ids only: never put secrets here.
name: <product name>

linear:
  team: SCO # team key, findings land in its Triage
  project: # optional Linear project name or id
  labels: [DevOps] # must already exist in the team

gcp:
  project: <gcp-project-id>
  billing_account: # optional, enables the budget check
  billing_export: # optional BigQuery table `project.dataset.gcp_billing_export_v1_XXXX`
  cloud_run: [] # service names, e.g. [api, api-staging]
  region: europe-west1
  cloud_sql: [] # instance names
  artifact_registry: # optional repo path, for image vulnerability scans

firebase: [] # optional Firebase project ids

infra:
  dockerfile: Dockerfile

code:
  main_branch: main
  protected_branches: [main, develop, staging]
  stale_branch_days: 30
  commands: [] # in order, e.g. [npm run build, npm run typecheck, npm run lint, npm test]
  audit_commands: [] # empty = stack default (npm audit / flutter pub outdated)

thresholds:
  errors_per_day: 10
  p95_latency_ms: 1000
  cpu_pct: 70
  memory_pct: 80
  db_cpu_pct: 70
  db_disk_pct: 75
  cost_growth_pct: 20

defaults:
  window_days: 30
---

# Health audit

Run `/health-audit`. Reports go to `.flow/audits/`.

## Notes

<What the audit should know: shared resources, things that look wrong but are deliberate, services that are allowed to be quiet.>

## Extra checks

<!-- Project-specific checks, one per bullet, e.g.
- Stripe webhook endpoint has had no failed deliveries in the window
-->
