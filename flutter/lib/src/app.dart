import 'package:flutter/material.dart';
import 'package:signals/signals_flutter.dart';

import 'localization/app_localizations.dart';
import 'settings/settings_manager.dart';
import 'shared/extensions.dart';
import 'shared/routes.dart';
import 'shared/services/service_locator.dart';
import 'shared/styles.dart';

/// The Widget that configures your application.
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Watch((_) {
      final themeMode = get<SettingsManager>().themeMode;

      return MaterialApp.router(
        // enable restoring the navigation stack
        restorationScopeId: 'app',

        // app localizations
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: const [
          Locale('en'), // English, no country code
        ],

        onGenerateTitle: (context) => context.tr.appTitle,

        // app theme
        theme: styles.themeLight,
        darkTheme: styles.themeDark,
        themeMode: themeMode,

        // app routes
        routerDelegate: routes.routerDelegate,
        routeInformationParser: routes.routeInformationParser,
        routeInformationProvider: routes.routeInformationProvider,

        debugShowCheckedModeBanner: false,
      );
    });
  }
}
