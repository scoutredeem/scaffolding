import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:test_app/src/app.dart';
import 'package:test_app/src/settings/settings_manager.dart';
import 'package:test_app/src/settings/settings_service.dart';
import 'package:test_app/src/shared/services/store_service.dart';

import 'doubles/store_double.dart';

void main() {
  // MyApp reads its settings from the service locator, so register the
  // services it needs with a test store before pumping it.
  setUp(() async {
    final store = await StoreDouble.create(name: 'widgettestbox');
    GetIt.I.registerSingleton<StoreService>(store);
    GetIt.I.registerSingleton<SettingsManager>(
      SettingsManager(SettingsService(store)),
    );
  });

  tearDown(() async {
    final store = GetIt.I<StoreService>() as StoreDouble;
    await store.cleanup();
    await GetIt.I.reset();
  });

  testWidgets('App starts on the root screen', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();

    expect(find.text('Root Screen'), findsOneWidget);
  });

  testWidgets('Settings opens from the root screen', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.settings));
    await tester.pumpAndSettle();

    expect(find.text('Settings'), findsOneWidget);
  });
}
