# Styles

## Contents

Read whenever you set up the theme or style a widget:

- Mapping design tokens (Figma variables) to the theme
- Adding a color or text style
- Choosing a color or text style inside a widget
- Light and dark mode

## Acceptable Defaults

- The theme lives in `lib/src/shared/styles.dart` as one `buildAppTheme(Brightness)` function. `app.dart` passes it to `theme` and `darkTheme`, and the theme mode comes from a settings signal.
- Split the design tokens by where they fit:
  - **`ColorScheme`** gets the tokens that match a Material slot by meaning (`primary`, `secondary`, `error`, `surface`, `onSurface`, `outline`, ...).
  - **`AppColorsExtension`** (a `ThemeExtension`) holds the color tokens with no Material slot, named as in the design (`surfaceMedium`, `selected`, ...).
  - **`AppTypographyExtension`** (a `ThemeExtension`) holds the design's type ramp under the design's own names (`h2`, `body`, `tag`, ...). Don't force-fit a small ramp into Material's 12 `TextTheme` slots.
- Each extension has one instance per brightness (`AppColorsExtension.light`/`.dark`, `AppTypographyExtension.forBrightness(...)`) and implements `copyWith` and `lerp`, so theme switches animate.
- Widgets reach tokens through `BuildContext` extensions in `extensions.dart` — `context.appColors`, `context.appType` — and `Theme.of(context).colorScheme` for Material slots.
- No hex colors, `Colors.*` or hand-built `TextStyle(fontSize: ...)` in widgets. Adjust a token with `copyWith` instead: `context.appType.body.copyWith(color: colorScheme.secondary)`.
- A new token goes into the design first, then into `ColorScheme` or an extension. Never into a single widget.
- Record the token mapping in an ADR, since it is a judgement call that the next person will want to know about.

## Theme extensions

```dart
/// Design tokens with no Material `ColorScheme` slot.
class AppColorsExtension extends ThemeExtension<AppColorsExtension> {
  const AppColorsExtension({required this.surfaceMedium, required this.selected});

  final Color surfaceMedium;
  final Color selected;

  static const light = AppColorsExtension(
    surfaceMedium: Color(0xCCF7F7F1),
    selected: Color(0x66BABCA9),
  );

  static const dark = AppColorsExtension(
    surfaceMedium: Color(0xCC151613),
    selected: Color(0x6643443B),
  );

  @override
  AppColorsExtension copyWith({Color? surfaceMedium, Color? selected}) =>
      AppColorsExtension(
        surfaceMedium: surfaceMedium ?? this.surfaceMedium,
        selected: selected ?? this.selected,
      );

  @override
  AppColorsExtension lerp(ThemeExtension<AppColorsExtension>? other, double t) {
    if (other is! AppColorsExtension) return this;
    return AppColorsExtension(
      surfaceMedium: Color.lerp(surfaceMedium, other.surfaceMedium, t)!,
      selected: Color.lerp(selected, other.selected, t)!,
    );
  }
}

/// The design's type ramp under its own names.
class AppTypographyExtension extends ThemeExtension<AppTypographyExtension> {
  const AppTypographyExtension({required this.h2, required this.body});

  final TextStyle h2;
  final TextStyle body;

  factory AppTypographyExtension.forBrightness(Brightness brightness) {
    final onSurface = brightness == Brightness.light
        ? const Color(0xFF151613)
        : const Color(0xFFE6E8DE);
    return AppTypographyExtension(
      h2: GoogleFonts.ebGaramond(fontSize: 28, fontStyle: FontStyle.italic, color: onSurface),
      body: GoogleFonts.lato(fontSize: 15, color: onSurface),
    );
  }

  // copyWith and lerp as above, using TextStyle.lerp
}
```

## Theme

```dart
ThemeData buildAppTheme(Brightness brightness) {
  final isLight = brightness == Brightness.light;
  final colorScheme = ColorScheme(
    brightness: brightness,
    primary: _brand,
    onPrimary: Colors.white,
    secondary: isLight ? _secondaryLight : _secondaryDark,
    onSecondary: isLight ? _onSurfaceLight : _onSurfaceDark,
    error: _error,
    onError: Colors.white,
    surface: isLight ? _surfaceLight : _surfaceDark,
    onSurface: isLight ? _onSurfaceLight : _onSurfaceDark,
    outline: isLight ? _outlineLight : _outlineDark,
  );

  return ThemeData(
    brightness: brightness,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: colorScheme.surface,
    useMaterial3: true,
    extensions: [
      isLight ? AppColorsExtension.light : AppColorsExtension.dark,
      AppTypographyExtension.forBrightness(brightness),
    ],
  );
}
```

## Using tokens in widgets

```dart
// extensions.dart
extension AppThemeX on BuildContext {
  AppColorsExtension get appColors =>
      Theme.of(this).extension<AppColorsExtension>()!;
  AppTypographyExtension get appType =>
      Theme.of(this).extension<AppTypographyExtension>()!;
}

// In a widget
Text(context.tr.loginTitle, style: context.appType.h2);
Container(color: context.appColors.surfaceMedium);
Text(
  context.tr.favoritesEmpty,
  style: context.appType.body.copyWith(
    color: Theme.of(context).colorScheme.secondary,
  ),
);
```
