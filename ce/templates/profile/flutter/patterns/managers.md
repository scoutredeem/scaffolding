# Managers

## Contents

Read whenever you need to manage a views state or business logic:

- New screen with state and logic
- Feature that needs co-ordination between services and other managers

## Acceptable Defaults

- Managers own reactive `Signal<T>` state and orchestrate services.
- Managers must be lean: no direct I/O, no SDK imports (Firebase, HTTP, etc.). A manager method should call a service, then update a signal.
- Prefer typed domain values over raw strings for bounded concepts that cross
  layers, widgets, analytics, or storage. Use enums/extensions for values like
  playback surfaces, quality labels, event names, tabs, and persisted keys.
- Dependency injection is mandatory. All dependencies must be declared as `final` fields and received through the constructor — never resolved via `get<T>()` inside a manager or service body. `get<T>()` belongs only in widgets and in `registerServices()`.

```dart
// WRONG
class AuthManager {
  Future<void> deleteAccount() async {
    await get<StoryProgressService>().deleteAll(ownerId: id);
  }
}

// RIGHT
class AuthManager {
  final StoryProgressService storyProgressService;
  AuthManager({required this.storyProgressService, ...});

  Future<void> deleteAccount() async {
    await storyProgressService.deleteAll(ownerId: id);
  }
}
```
