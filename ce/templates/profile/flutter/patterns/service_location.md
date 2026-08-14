# Service Location

## Contents

Read whenever you need to use a service or a manager

- Registering a new service or manager
- Manage the lifecycle of a service or manager
- Resolving a reference to a registered service

## Acceptable Defaults

- Use the `get_it` package for service location
- Do not instantiate managers/services with constructors — always resolve via `get<T>()`
- Register all singletons in a single `registerServices()` called from `main()`
- **Order matters** — register dependencies before dependents

```dart
Future<void> registerServices() async {
  // services first
  get.registerSingleton<StoreService>(await StoreService.instance());
  get.registerSingleton<ApiService>(ApiService(http.Client()));

  // managers second (they depend on services)
  get.registerSingleton<HomeManager>(HomeManager(get(), get()));
  get.registerSingleton<NavigationManager>(NavigationManager());
}
```

Use anywhere — no `BuildContext` needed:

```dart
get<HomeManager>().load();
get<StoreService>().putSetting('key', value);
```
