import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

extension ExtendBuildContext on BuildContext {
  AppLocalizations get tr => AppLocalizations.of(this)!;
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;
  double get displayScale => MediaQuery.of(this).devicePixelRatio;
  bool get isLTR => Directionality.of(this) == TextDirection.ltr;

  Size get size => MediaQuery.of(this).size;
  double get width => size.width;
  double get height => size.height;

  bool get isLargeWidth => width > 600;
}

extension MockableDateTime on DateTime {
  static DateTime? _customTime;
  static DateTime get current {
    return _customTime ?? DateTime.now();
  }

  static set customTime(DateTime customTime) {
    _customTime = customTime;
  }

  DateTime get midnight {
    return DateTime(year, month, day);
  }
}
