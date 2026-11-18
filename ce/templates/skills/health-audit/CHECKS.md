# Check commands

How to collect the evidence for each check in `SKILL.md`. Status rules live in `SKILL.md`; this file only says where the numbers come from. `<window>` is the audit window in days, `<start>`/`<end>` its RFC 3339 bounds.

## Code checks

### Stale branches

```bash
git fetch --prune
git for-each-ref refs/remotes --format='%(refname:short) %(committerdate:short) %(authorname)'
git branch -r --merged origin/<code.main_branch>
gh pr list --state open --json headRefName
```

Leave out `code.protected_branches` and `origin/HEAD`.

### Build and tests

Run each command in `code.commands` in order. Keep the exit code and the last ~30 lines of output.

### Vendor packages

Run `code.audit_commands`. When it is empty, use the stack default:

- npm: `npm audit --json` and `npm outdated --json`
- Flutter: `flutter pub outdated --json`, plus `osv-scanner --lockfile=pubspec.lock` when `osv-scanner` is installed

To tell production from dev dependencies, read `dependencies` vs `devDependencies` in `package.json`, or `dependencies` vs `dev_dependencies` in `pubspec.yaml`.

### Runtime and base image

Read the `FROM` lines in `infra.dockerfile`. For each runtime (node, python, dart…), fetch `https://endoflife.date/api/<product>.json` and find the entry whose `cycle` matches the image tag. Use its `eol` and `latest` fields.

When `gcp.artifact_registry` is set:

```bash
gcloud artifacts docker images list <gcp.artifact_registry> --show-occurrences --format=json --project=<gcp.project>
```

## Infrastructure checks

### Metrics API

Every metric below comes from the Monitoring API:

```bash
curl -s -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://monitoring.googleapis.com/v3/projects/<gcp.project>/timeSeries" \
  --get \
  --data-urlencode 'filter=metric.type="<metric>" AND <resource filter>' \
  --data-urlencode 'interval.startTime=<start>' \
  --data-urlencode 'interval.endTime=<end>' \
  --data-urlencode 'aggregation.alignmentPeriod=86400s' \
  --data-urlencode 'aggregation.perSeriesAligner=<ALIGN_SUM for counts, ALIGN_PERCENTILE_95 for distributions, ALIGN_MAX for utilisation>'
```

From the daily points, report the peak and the median.

### Error logs

For each service in `gcp.cloud_run`:

```bash
gcloud logging read \
  'resource.type="cloud_run_revision" AND resource.labels.service_name="<svc>" AND severity>=ERROR' \
  --freshness=<window>d --limit=1000 --format=json --project=<gcp.project>
```

- Group entries by normalised message: strip ids, timestamps and numbers.
- Count entries per day to get the peak day.
- When exactly 1000 entries come back, the cap was hit: the counts are a lower bound. Say so in the evidence.

### System load

Resource filter: `resource.type="cloud_run_revision" AND resource.labels.service_name="<svc>" AND resource.labels.location="<gcp.region>"`.

- `run.googleapis.com/request_count`, grouped by `metric.label.response_code_class`
- `run.googleapis.com/request_latencies` (p95)
- `run.googleapis.com/container/cpu/utilizations` (p95)
- `run.googleapis.com/container/memory/utilizations` (p95)
- `run.googleapis.com/container/instance_count` (max)

### Database load

Resource filter: `resource.type="cloudsql_database" AND resource.labels.database_id="<gcp.project>:<instance>"`.

- `cloudsql.googleapis.com/database/cpu/utilization`
- `cloudsql.googleapis.com/database/memory/utilization`
- `cloudsql.googleapis.com/database/disk/utilization`
- `cloudsql.googleapis.com/database/postgresql/num_backends` (or `database/mysql/connections`)

### Database backups

```bash
gcloud sql instances describe <instance> --format=json --project=<gcp.project>
gcloud sql backups list --instance=<instance> --limit=10 --format=json --project=<gcp.project>
```

Read `settings.backupConfiguration`: `enabled`, `pointInTimeRecoveryEnabled` (or `binaryLogEnabled` on MySQL) and `backupRetentionSettings`.

### Costs

With `gcp.billing_export` set, total cost by service for this month and the two before:

```bash
bq query --project_id=<gcp.project> --use_legacy_sql=false --format=json \
  'SELECT invoice.month, service.description, SUM(cost) AS cost
   FROM `<gcp.billing_export>`
   WHERE invoice.month >= "<YYYYMM two months ago>"
   GROUP BY 1, 2 ORDER BY 1, 3 DESC'
```

Without it, when `gcp.billing_account` is set:

```bash
gcloud billing budgets list --billing-account=<gcp.billing_account> --format=json --project=<gcp.project>
```

Console link: `https://console.cloud.google.com/billing/<gcp.billing_account>/reports?project=<gcp.project>`.

### Firebase

For each project id in `firebase`:

```bash
firebase apps:list --project=<id>
firebase functions:log --project=<id>
```

Console links for what the CLI can't reach:

- Crashlytics: `https://console.firebase.google.com/project/<id>/crashlytics`
- Performance: `https://console.firebase.google.com/project/<id>/performance`
