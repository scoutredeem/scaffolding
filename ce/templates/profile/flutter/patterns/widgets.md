# Widgets

## Contents

Read when authoring or editing widgets and UI

- Creating screens
- Creating UI elements

## Recommended Defaults

- a widget's `build` method must only describe UI structure. Any filtering, sorting, or derived data computation belongs in the manager as a named getter, method or `computed` — not inline in `build`.
- Resolve managers with `get<T>()`. In a `StatefulWidget`, resolve once into a `late final` field.
- Read signals only inside a `SignalBuilder` (from `package:signals/signals_flutter.dart`), so the widget rebuilds when they change. Give each independently updating section its own `SignalBuilder` rather than wrapping the whole screen in one.
- Render an `AppAsyncState` with an exhaustive `switch`. See `error_handling.md`.
- Take colors and text styles from the theme (`context.appType`, `context.appColors`, `Theme.of(context).colorScheme`), never literals. See `styles.md`.
- For `StatefulWidget` classes, keep method order consistent for readability:

1. `build`
2. Private helpers/getters
3. `initState`
4. other widget lifecycle methods
5. `dispose`

```dart
class HomeBody extends StatefulWidget {
  const HomeBody({super.key});

  @override
  State<HomeBody> createState() => _HomeBodyState();
}

class _HomeBodyState extends State<HomeBody> {
  late final HomeManager _home;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(context.tr.featuredTitle, style: context.appType.h3),
        SignalBuilder(builder: (context) => _buildItems(context)),
      ],
    );
  }

  Widget _buildItems(BuildContext context) => switch (_home.itemsState) {
    AppAsyncSuccess(:final data) => ItemList(items: data),
    AppAsyncFailure(:final message) => ErrorBanner(message: message),
    _ => const SectionLoading(),
  };

  @override
  void initState() {
    super.initState();
    _home = get<HomeManager>();
    _home.loadItems();
  }
}
```
