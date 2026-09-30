# Managers

## Contents

Read whenever you need to manage a view's state or business logic:

- New screen with state and logic
- Feature that needs coordination between services and other managers

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
  AuthManager(this._storyProgressService);

  final StoryProgressService _storyProgressService;

  Future<void> deleteAccount() async {
    await _storyProgressService.deleteAll(ownerId: id);
  }
}
```

## State with `signals`

- Use the `signals` package for all shared state. Managers import `package:signals/signals.dart` (no Flutter dependency); widgets import `package:signals/signals_flutter.dart`.
- Keep signals private and expose their value through a typed getter. Widgets change state by calling manager methods, never by writing to a signal.
- Anything a widget waits on (fetch, submit, toggle) is a `Signal<AppAsyncState<T>>` — one per action, not shared `loading`/`error` flags. See `error_handling.md`.
- Plain synchronous state with no round-trip (a selected tab, a local preference) can be a plain `Signal<T>`.
- Derived state is a `computed` rather than a second signal that must be kept in sync. Expose it as a `late final Computed<T>`.
- Never use `setState` or another state manager in managers. Signals propagate automatically — no `notifyListeners()`, no `StreamBuilder`.

```dart
import 'package:signals/signals.dart';

class HomeManager {
  HomeManager(this._contentService);

  final ContentService _contentService;

  final _itemsState = Signal<AppAsyncState<List<Item>>>(const AppAsyncIdle());
  AppAsyncState<List<Item>> get itemsState => _itemsState.value;

  final _selectedTab = Signal<HomeTab>(HomeTab.featured);
  HomeTab get selectedTab => _selectedTab.value;
  void selectTab(HomeTab tab) => _selectedTab.value = tab;

  /// Derived from [itemsState] — no separate fetch or cache.
  late final Computed<AppAsyncState<List<Item>>> favoritesState = computed(
    () => switch (_itemsState.value) {
      AppAsyncSuccess(:final data) =>
        AppAsyncSuccess(data.where((i) => i.isFavorite).toList()),
      AppAsyncFailure(:final message) => AppAsyncFailure(message),
      AppAsyncLoading() => const AppAsyncLoading(),
      AppAsyncIdle() => const AppAsyncIdle(),
    },
  );

  Future<void> loadItems() async {
    _itemsState.value = const AppAsyncLoading();
    try {
      _itemsState.value = AppAsyncSuccess(await _contentService.getItems());
    } catch (_) {
      _itemsState.value = const AppAsyncFailure('Could not load items');
    }
  }
}
```

- When two parallel loads depend on the same fetch, share the in-flight `Future` instead of firing a second request or reading a signal that is still `AppAsyncLoading`.
- Filtering, sorting and other derived data belong here as a named getter, method or `computed` — not inline in a widget's `build`.
