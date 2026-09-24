# Error Handling

## Contents

Read when crafting a feature that needs to handle loading or error states:

- Services that are unavailable or broken
- Missing or corrupted cache
- Any manager action a widget waits on (fetch, submit, toggle)

## Acceptable Defaults

- Model every async manager action as a `Signal<AppAsyncState<T>>` — never separate `loading`/`error` booleans. The sealed type lets widgets `switch` exhaustively over what's actually possible.
- Services assume the happy path and let exceptions bubble up. The manager is the single place where errors are caught and turned into state.
- A failed request becomes `AppAsyncFailure(message)` with a message fit to show the user. Prefer the backend's message when it has one, with a local fallback. When the backend message matters, have the service throw a custom exception that carries it (e.g. `ApiException`).
- Cache-first data: show the cached value as `AppAsyncSuccess` immediately, then refresh. A failed refresh never replaces good cached content — only surface `AppAsyncFailure` when there is nothing to fall back on.
- Action methods that drive navigation (login, submit) also return `Future<bool>` so the widget can `pop`/`go` on success without watching for the state transition.
- Provide a `reset<Action>State()` method that returns the signal to `AppAsyncIdle` when a screen is re-entered, so a stale error or success isn't shown again.
- Only report to Crashlytics when a caught error is a real bug worth engineering attention (e.g. a purchase that failed to verify) — not for expected failures like no network. Go through `CrashlyticsService.recordError(e, st, reason: ...)`, never `FirebaseCrashlytics` directly from a manager.
- Uncaught errors are wired to Crashlytics once in `main()` (`FlutterError.onError`, `runZonedGuarded`, isolate error listener) — don't add blanket catches just to log.

## AppAsyncState

Lives in `lib/src/shared/models/async_state.dart`:

```dart
/// Sealed variant state for an async operation (e.g. a manager action driven
/// by a `Signal<AppAsyncState<T>>`), used instead of separate loading/error
/// booleans so widgets can switch exhaustively over what's actually possible.
sealed class AppAsyncState<T> {
  const AppAsyncState();
}

class AppAsyncIdle<T> extends AppAsyncState<T> {
  const AppAsyncIdle();
}

class AppAsyncLoading<T> extends AppAsyncState<T> {
  const AppAsyncLoading();
}

class AppAsyncSuccess<T> extends AppAsyncState<T> {
  const AppAsyncSuccess(this.data);
  final T data;
}

class AppAsyncFailure<T> extends AppAsyncState<T> {
  const AppAsyncFailure(this.message);
  final String message;
}
```

Use `AppAsyncState<bool>` for fire-and-forget actions (submit, delete) and `AppAsyncState<Model>` when the action produces data the screen renders.

## In the manager

```dart
class AuthManager {
  AuthManager(this._authService, this._store);

  final AuthService _authService;
  final StoreService _store;

  final _loginState = Signal<AppAsyncState<bool>>(const AppAsyncIdle());
  AppAsyncState<bool> get loginState => _loginState.value;

  Future<bool> login(String email, String password) async {
    _loginState.value = const AppAsyncLoading();
    try {
      final user = await _authService.login(email: email, password: password);
      await _store.setUser(user);
      _loginState.value = const AppAsyncSuccess(true);
      return true;
    } on ApiException catch (e) {
      _loginState.value = AppAsyncFailure(e.message);
      return false;
    } catch (_) {
      _loginState.value = const AppAsyncFailure('Network error. Please try again.');
      return false;
    }
  }

  void resetLoginState() => _loginState.value = const AppAsyncIdle();
}
```

Cache-first load:

```dart
Future<void> loadItems() async {
  final cached = _store.itemsCache;
  _itemsState.value = cached != null
      ? AppAsyncSuccess(cached)
      : const AppAsyncLoading();

  try {
    final items = await _contentService.getItems();
    await _store.setItemsCache(items);
    _itemsState.value = AppAsyncSuccess(items);
  } catch (_) {
    if (cached == null) {
      _itemsState.value = const AppAsyncFailure('Could not load items');
    }
  }
}
```

## In the widget

Read the state inside a `SignalBuilder` and `switch` over it. Group idle and loading with `_` when they render the same:

```dart
SignalBuilder(
  builder: (context) => switch (_home.itemsState) {
    AppAsyncSuccess(:final data) => ItemList(items: data),
    AppAsyncFailure(:final message) => ErrorBanner(message: message),
    _ => const SectionLoading(),
  },
)
```

For forms, derive the flags you need from the one state:

```dart
final state = _auth.loginState;
final loading = state is AppAsyncLoading<bool>;
final error = switch (state) {
  AppAsyncFailure(:final message) => message,
  _ => null,
};
```

Show failures with the shared `ErrorBanner` (inline, above the form) rather than a one-off styled `Text`.
