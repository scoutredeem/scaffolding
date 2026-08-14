# Organisation

## Contents

Read whenever you need to decide how to organise the folder structure or the code of a feature:

- Folder structure
- Reading and mutating shared memory
- Crafting business logic

## Folder Organisation

The app source code is in the `lib/src` folder and organised by feature. That means where possible the root folders are feature folders that holds the models, managers and widgets needed for that feature except for the `shared` folder.

Models, services, widgets and utilities that are used all across the app are located in the `shared` folder.

```
lib/
  main.dart                      # App entry: init services, runApp()
  src/
    app.dart                     # MaterialApp.router — theme, localization, router wiring
    shared/
      routes.dart                # GoRouter definition (all routes in one place)
      styles.dart                # ThemeData definitions (light/dark)
      extensions.dart            # Shared BuildContext and String extensions
      services/
        service_locator.dart     # GetIt registration — all singletons registered here
        store_service.dart       # Local persistence — hive_ce key-value store
        analytics_service.dart
    <feature>/
      <feature>_screen.dart      # Each app route resolves to a screen
      <feature>_manager.dart     # Reactive state + business logic
      models/                    # Plain Dart data classes
      services/                  # I/O: API calls, device APIs, etc.
      widgets/
    localization/
      app_en.arb                 # Source strings — edit this for new strings
      app_localizations.dart     # Generated — do not edit
```

## Code Organisation

The app is crafted along a layered MVVM architecture:

- `M`: models and services do not depend on any other part of the app. A service can
  reference models and other services, but not cyclical. Services are registered in the
  central `service_locator.dart` and have a `_service` filename suffix.
- `V`: page and component widgets are driven by view managers and can also depend directly
  on models and services. Page widgets have a `_screen` filename suffix.
- `VM`: view managers are the glue between the view and the base model/service layer. They
  can depend on the `M` layer, but not the `V` layer. Managers are responsible for
  updating the view and reacting to user input and other events via reactive Signal
  properties. They are registered in the service locator as a lazy loading singleton and
  have a `_manager` filename suffix.

## State management

- Use the `signals` package to manage shared state
- A screen's state and business logic is kept in it's manager file
- Use getters and setters to access Signal values
- Never use `setState` or other state managers in managers
- Signals propagate automatically — no `notifyListeners()`, no `setState()`, no `StreamBuilder`.

example manager state:

```dart
// Manager — expose signals as typed getters
class HomeManager {
  final _itemsSignal = Signal<List<Item>>([]);
  List<Item> get items => _itemsSignal.value;

  final _loadingSignal = Signal<bool>(false);
  bool get loading => _loadingSignal.value;

  Future<void> load() async {
    _loadingSignal.value = true;
    _itemsSignal.value = await _service.fetchItems();
    _loadingSignal.value = false;
  }
}
```

In the manager's screen:

- use get<IndexManager>() to resolve managers and services from the get_it service locator
- the build tree use SignalBuilder((\_) { ... }) from signals to trigger rebuilds
