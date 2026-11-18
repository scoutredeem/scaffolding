---
name: health-audit
description: 'Run the periodic security and health audit for this project from docs/agents/audit.md, write a dated report to .flow/audits/, and propose Linear Triage issues for the findings.'
disable-model-invocation: true
---

**Health audit** is read-only: every command it runs reads (describe, list, read, query, fetch). It writes only the **audit report**, and the Linear issues and comments the user chooses. What should change goes in the report as a suggested action.

**Audit file**: `docs/agents/audit.md`. Its YAML frontmatter holds the project's ids and thresholds, and its body holds notes and extra checks. The blank template is `../../agent-docs/agents/audit.md`, relative to this skill's real folder (resolve the symlink first).

**Audit report**: `.flow/audits/<YYYY-MM-DD>.md`, committed with the project, so each run can compare against the last one.

**Finding**: one check result, with a status (`ok` / `warn` / `fail` / `skipped`), the evidence behind it (numbers, ids, log excerpts) and, for `warn` or `fail`, a suggested action.

**Check commands**: before running a check, read its section in [`CHECKS.md`](CHECKS.md). It has the commands, metric names and filters. The status rules are below.

## Rules

- Pass the GCP project explicitly on **every** cloud call: `--project=<gcp.project>` for `gcloud`, `--project_id=<gcp.project>` for `bq`, `--project=<id>` for `firebase`. The active gcloud config often points at another client's project.
- A CLI that is missing, logged out, or denied permission makes the check `skipped`. Put the reason and the login command in the report, and move on to the next check.
- Never print secrets, tokens, connection strings or personal data from logs. Redact emails and user ids in log excerpts.
- A check that the audit file doesn't configure is `skipped (not configured)`. It is not a failure.

## Setup

Read `docs/agents/audit.md`. If it is missing → AUDIT PAUSED: copy the template there and fill in what can be found in the repo (Dockerfile, CI/CD config, `.env.example`), then ask for the rest.

Check the checkout: `git fetch`, then compare `HEAD` with `origin/<code.main_branch>`. If you are on another branch, or behind it → AUDIT PAUSED: ask the user to switch to an up-to-date `code.main_branch`, or to confirm auditing `HEAD` as it is. A dirty working tree goes in the report; keep going.

Find the previous report: the newest file in `.flow/audits/` dated before today. Its date sets the **window** for log and metric checks. With no previous report, or when that report is more than 60 days old, the window is the last `defaults.window_days` days. A report already dated today is overwritten by this run.

Echo `Auditing <name> gcp=<gcp.project> ref=<branch>@<short sha> window=<start>..<today>`.

Setup is done when the audit file is read, the ref is confirmed and the window is set.

### AUDIT PAUSED

```
AUDIT PAUSED

What I need from you:
  <one specific question or decision>
```

Wait.

## Code checks

1. **Stale branches**: every remote branch outside `code.protected_branches`, with its last commit date, author, whether it is merged into `code.main_branch`, and whether it has an open PR.
   - No commit in `code.stale_branch_days` → `warn`. If it is also unmerged with no open PR, say so: that work is either finished elsewhere or abandoned.
2. **Build and tests**: each command in `code.commands`, in order.
   - Any command exits non-zero → `fail`, with the last ~30 lines of output.
   - A command needs a service that isn't running (test database, emulator) → `skipped`, naming the service.
3. **Vendor packages**: advisories grouped by package, each marked as a production or dev dependency. Outdated packages: report only those a major version behind.
   - npm critical/high advisory → `fail`. Moderate → `warn`.
   - Flutter: an `osv-scanner` advisory → `fail` in a production dependency, `warn` in a dev dependency. A major version behind → `warn`.
4. **Runtime and base image**: each runtime in the `FROM` lines of `infra.dockerfile`. No Dockerfile → `skipped (not configured)`.
   - The cycle is past EOL → `fail`.
   - The cycle reaches EOL within 90 days → `warn`.
   - A pinned patch version is behind the latest patch of its cycle → `warn`, listing the versions it is behind.
   - With `gcp.artifact_registry` set, also list the deployed image's vulnerabilities: critical → `fail`, high → `warn`.

Code checks are done when each of the four checks has a **finding**.

## Infrastructure checks

Use the window for every time range. For each metric, report the peak and the median daily value, and the change since the previous report when it has numbers.

1. **Error logs**: for each `gcp.cloud_run` service, the top 10 normalised error messages, with their counts and the first and last time each was seen. Mark the errors that are new since the previous report.
   - The peak day has more errors than `thresholds.errors_per_day` → `warn`.
   - Repeated 5xx responses or crash loops → `fail`.
2. **System load**: for each Cloud Run service, request count by response class, p95 latency, p95 CPU and memory, and max instance count.
   - p95 latency above `thresholds.p95_latency_ms`, CPU above `thresholds.cpu_pct`, or memory above `thresholds.memory_pct` → `warn`.
   - Memory above 95% (out-of-memory risk) or 5xx above 1% of requests → `fail`.
3. **Database load**: for each `gcp.cloud_sql` instance, CPU, memory, disk and connections.
   - CPU above `thresholds.db_cpu_pct`, memory above `thresholds.memory_pct`, or disk above `thresholds.db_disk_pct` → `warn`.
   - Disk above 90% → `fail`.
4. **Database backups**: for each `gcp.cloud_sql` instance, the backup configuration and the last 10 backups.
   - The newest `SUCCESSFUL` backup is older than 26 hours, or any backup in the window failed → `fail`.
   - Point-in-time recovery is off → `warn`.
5. **Costs**: cost by service for this month and the two before.
   - Month-on-month growth above `thresholds.cost_growth_pct` → `warn`.
   - No billing export: record the budgets when access allows, put the billing console link in the report, and mark the check `skipped (manual)`.
6. **Firebase**: for each `firebase` project, what the CLI can reach (apps, function logs), plus console links for Crashlytics and performance.
   - Function errors follow the error log rules above.
7. **Extra checks**: each item under `## Extra checks` in the audit file body, with the status rule it states, or `warn` when something looks wrong.

Infrastructure checks are done when each of the seven checks has a **finding**.

## Report

Write `.flow/audits/<YYYY-MM-DD>.md`:

```markdown
# Health audit <YYYY-MM-DD>: <name>

Window: <start>..<end> · Ref: <branch>@<short sha> · Previous: <link to previous report or "none">

## Summary

| Check | Status | Headline |
| ----- | ------ | -------- |

## Findings

### <Check name>: <status>

<evidence: numbers, short excerpts, ids>

**Action:** <suggested action> <!-- only for warn/fail -->

## Compared with the previous audit

- Resolved: …
- New: …
- Still open: … (with Linear ids from the previous report)
```

Show the summary table in chat.

Report is done when the file is written.

## Triage

Each `warn` or `fail` **finding** becomes a draft issue. Before drafting, search the Linear team (`list_issues`, query on the finding's subject, open states) for an existing issue:

- An open issue exists → suggest a comment on it with the new evidence, instead of a new issue.
- No match → draft a new issue.

Each draft has:

- **Title**: what needs to change, phrased as an outcome (`Upgrade Node 20 base image to Node 22 LTS`). It is not the symptom (`Node is old`).
- **Description**: the evidence, why it matters, the suggested action and a link to the report file. Put the commands and raw output in a collapsible `Agent notes` section.
- **Priority**: `fail` → High (Urgent for a security advisory with a known exploit in a production dependency). `warn` → Medium or Low.

Show all the drafts and comments as a numbered list. Then offer the choice as lettered options, each on its own line, with the recommendation marked: create all, create a selection, or none. Use a structured choice tool if one is available. Wait.

Create the chosen issues in `linear.team`, in its Triage state, with `linear.project` and `linear.labels` when set. Post the chosen comments. Then write the issue ids back into the report next to their findings.

Triage is done when the user has chosen and the chosen issues and comments exist.

## Done

- Path of the report file and the summary counts (ok / warn / fail / skipped)
- The Linear issues created and the comments posted
- Skipped checks and what would enable them (a login command, an API to enable, a value to add to `docs/agents/audit.md`)
- Suggest committing the report with `qa: health audit <date>`
