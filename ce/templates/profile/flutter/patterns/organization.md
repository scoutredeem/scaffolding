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
      styles.dart                # buildAppTheme(), ColorScheme + ThemeExtensions (light/dark)
      extensions.dart            # Shared BuildContext extensions (appColors, appType, tr)
      models/
        async_state.dart         # Sealed AppAsyncState<T> for async actions
      widgets/
        error_banner.dart        # Shared inline error display
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

- Use the `signals` package to manage shared state, kept in the feature's manager. See `managers.md`.
- Async actions and their loading/error states use `AppAsyncState`. See `error_handling.md`.
- Colors and text styles come from the theme via `context.appColors` and `context.appType`. See `styles.md`.
