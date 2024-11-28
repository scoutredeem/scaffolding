import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

const designHeight = 812;``

extension ExtendBuildContext on BuildContext {
    AppLocalizations get tr => AppLocalizations.of(this)!;
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;
  double get displayScale => MediaQuery.of(this).devicePixelRatio;
  bool get isLTR => Directionality.of(this) == TextDirection.ltr;

  Size get size => MediaQuery.of(this).size;
  double get width => size.width;
  double get height => size.height;

  EdgeInsets get padding => MediaQuery.of(this).padding;

  double get viewPortHeight => height - padding.top - padding.bottom;

  bool get hasNotch => padding.top != 0;
  bool get hasBottomPadding => padding.bottom != 0;

  bool get isLargeWidth => width > 600;

  /// Convert design pixels to device pixels
  double dpi(double designPixels) {
    return designPixels * height / designHeight;
  }

  String get location {
    final router = GoRouter.of(this);
    final RouteMatch lastMatch =
        router.routerDelegate.currentConfiguration.last;
    final RouteMatchList matchList = lastMatch is ImperativeRouteMatch
        ? lastMatch.matches
        : router.routerDelegate.currentConfiguration;
    return matchList.uri.toString();
  }
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

extension WidgetX on Widget {
  Widget debugBorder() {
    if (kDebugMode) {
      return Container(
        decoration: BoxDecoration(
          border: Border.all(
            width: 0.5,
            color: Colors.red,
          ),
        ),
        child: Stack(
          children: [
            this,
            // show the size of the widget
            Positioned.fill(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return GestureDetector(
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (context) {
                          return AlertDialog(
                            content: Text(
                              'width: ${constraints.maxWidth}, height: ${constraints.maxHeight}',
                            ),
                          );
                        },
                      );
                    },
                    child: Container(
                      color: Colors.red.withOpacity(0.3),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      );
    } else {
      return this;
    }
  }

  Widget px(double value) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: value),
      child: this,
    );
  }

  Widget debugGrid() {
    if (kDebugMode) {
      return GridPaper(
        color: Colors.red.withOpacity(0.5),
        divisions: 2,
        interval: 100,
        subdivisions: 5,
        child: this,
      );
    }

    return this;
  }
}

extension ColorX on Color {
  ColorFilter get colorFilter => ColorFilter.mode(this, BlendMode.srcIn);
}


// Adds a method to the Iterable class that allows you to intersperse a separator between each element of the iterable.
// Example:
// [1, 2, 3].intersperse(0) => [1, 0, 2, 0, 3]
// or
// [Text('Hello'), Text('World')].intersperse(SizedBox(width: 8)) => [Text('Hello'), SizedBox(width: 8), Text('World')]
extension Intersperse<T> on Iterable<T> {
  Iterable<T> intersperse(T separator) sync* {
    var iterator = this.iterator;
    if (iterator.moveNext()) {
      yield iterator.current;
      while (iterator.moveNext()) {
        yield separator;
        yield iterator.current;
      }
    }
  }
}