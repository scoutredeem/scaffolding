# Localization

## Contents

Read whenever you use literal strings in UI widgets:

- Prompts and labels
- UI microcopy
- User feedback messages

## Acceptable Defaults

ARB-based l10n. Configure `l10n.yaml`:

```yaml
arb-dir: lib/src/localization
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
```

Add a key to `app_en.arb`, then regenerate:

```bash
flutter gen-l10n
```

Expose via a `BuildContext` extension for ergonomic access:

```dart
extension AppLocalizationsX on BuildContext {
  AppLocalizations get tr => AppLocalizations.of(this)!;
}

// Usage
Text(context.tr.welcomeTitle)
```
