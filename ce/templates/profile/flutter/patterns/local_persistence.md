# Local Persistence

## Contents

Read whenever we need to store values locally in the client:

- User settings and preferences that need to persist across sessions
- Caching of expensive service call responses
- Persisting user actions and progress when there is no backend user service

## Recommended Defaults

- Use `hive_ce` + `hive_ce_flutter` for all local persistence. Store data as key-value pairs using typed enums — no Hive type adapters needed for simple data.
- One `'app'` box for all user prefs/settings
- Separate named boxes for large structured data (e.g. `'route_cache'`)
- Always use enum keys — never raw strings
- Store complex objects as JSON strings (jsonEncode/jsonDecode) — no Hive adapters
- Never use `shared_preferences` — hive_ce covers all persistence needs

## Package Installation

```bash
flutter pub add hive_ce hive_ce_flutter
```

## Pattern

```dart
import 'package:hive_ce_flutter/hive_flutter.dart';

enum StoreKeys {
  onboardingComplete,
  preferredUnit,
  workoutsCache,
  // add keys as needed
}

class StoreService {
  StoreService._(this._box);
  final Box _box;
  static StoreService? _instance;

  static Future<StoreService> instance() async {
    if (_instance != null) return _instance!;
    await Hive.initFlutter();
    final box = await Hive.openBox('app');
    _instance = StoreService._(box);
    return _instance!;
  }

  bool get onboardingComplete =>
      _box.get(StoreKeys.onboardingComplete.toString(), defaultValue: false);

  Future<void> setOnboardingComplete(bool v) =>
      _box.put(StoreKeys.onboardingComplete.toString(), v);

  // Complex objects: store as JSON string
  GoalsData? get goals {
    final raw = _box.get(StoreKeys.goals.toString());
    if (raw == null) return null;
    try { return GoalsData.fromJson(raw as String); } catch (_) { return null; }
  }

  Future<void> saveGoals(GoalsData g) =>
      _box.put(StoreKeys.goals.toString(), g.toJson());

  // Testing
  @visibleForTesting static void resetInstance() => _instance = null;
  @visibleForTesting StoreService.forTesting(this._box);
}
```

## Testing StoreService

Use a real Hive box in a temp directory:

```dart
import 'dart:io';
import 'package:hive_ce/hive.dart';

late Directory tempDir;
late StoreService store;

setUp(() async {
  tempDir = await Directory.systemTemp.createTemp('test_');
  Hive.init(tempDir.path);
  final box = await Hive.openBox('app');
  StoreService.resetInstance();
  store = StoreService.forTesting(box);
});

tearDown(() async {
  await Hive.close();
  await tempDir.delete(recursive: true);
});
```
