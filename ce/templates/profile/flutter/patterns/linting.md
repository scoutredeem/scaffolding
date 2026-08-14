# Linting

## Contents

Read once when setting up the project:

- Linting rules
- Analyzer options

## Acceptable Defaults

- **Package versions:** Always use the latest available versions of all packages — do not pin to specific versions. Check pub.dev or run `flutter pub add <package>` to get the current latest before adding any dependency.

Typical `analysis_options.yaml` additions on top of `flutter_lints`:

```yaml
linter:
  rules:
    prefer_single_quotes: true
    directives_ordering: true
    prefer_relative_imports: true
    curly_braces_in_flow_control_structures: false
```

Exclude generated files from analysis:

```yaml
analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
```
