import 'package:flutter/material.dart';

final styles = _Styles();

class _Styles {
  static const _colorPrimary = Color(0xFF6200EE);
  Color get colorPrimary => _colorPrimary;

  static const _colorSecondary = Color(0xFF03DAC6);
  Color get colorSecondary => _colorSecondary;

  // themes start with themeXyz
  final themeLight = ThemeData(
    brightness: Brightness.light,
    colorScheme: ColorScheme.fromSeed(
      brightness: Brightness.light,
      seedColor: _colorPrimary,
      secondary: _colorSecondary,
    ),
  );

  final themeDark = ThemeData(
    brightness: Brightness.dark,
    colorScheme: ColorScheme.fromSeed(
      brightness: Brightness.dark,
      seedColor: _colorPrimary,
      secondary: _colorSecondary,
    ),
  );
}
