# Widgets

## Contents

Read when authoring or editing widgets and UI

- Creating screens
- Creating UI elements

## Recommended Defaults

- a widget's `build` method must only describe UI structure. Any filtering, sorting, or derived data computation belongs in the manager as a named getter or method — not inline in `build`.
- For `StatefulWidget` classes, keep method order consistent for readability:

1. `build`
2. Private helpers/getters
3. `initState`
4. other widget lifecycle methods
5. `dispose`
