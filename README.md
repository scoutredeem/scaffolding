# Scaffolding

Scripts and templates we use to enforce standards and get a running start.

## Gallery

New Flutter project:

```
deno run -A https://raw.githubusercontent.com/scoutredeem/scaffolding/main/flutter/init.js
```

New GCP project:

```
deno run -A https://raw.githubusercontent.com/scoutredeem/scaffolding/main/ops/gcp.js [flags]
```

Prettier config for a project:

```
 curl https://raw.githubusercontent.com/scoutredeem/scaffolding/main/.prettierrc > .prettierrc
```

Changelog version configuration for a project:

```
 curl https://raw.githubusercontent.com/scoutredeem/scaffolding/main/.versionrc > .versionrc
```

Grab a PR linter for a project:

```
 curl https://raw.githubusercontent.com/scoutredeem/scaffolding/main/flutter/.github/workflows/lint_pr.yml > .github/workflows/lint_pr.yml
```

## Dependencies

Some scaffolding scripts use [dax][1] which requires [deno][2] to be installed.

Install `deno`:

```
curl -fsSL https://deno.land/x/install/install.sh | sh
```

[1]: https://github.com/dsherret/dax
[2]: https://deno.land/
