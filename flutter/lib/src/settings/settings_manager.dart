import 'package:flutter/material.dart';
import 'package:signals/signals.dart';

import '../shared/services/analytics_service.dart';
import '../shared/services/service_locator.dart';
import 'settings_service.dart';

/// A class that many Widgets can interact with to read user settings,
/// update user settings, or listen to user settings changes.
class SettingsManager {
  SettingsManager(this._settingsService) {
    loadSettings();
  }

  final SettingsService _settingsService;

  final themeModeSignal = signal<ThemeMode>(ThemeMode.system);

  Future<void> updateThemeMode(ThemeMode? newThemeMode) async {
    if (newThemeMode == null) return;
    if (newThemeMode == themeModeSignal.value) return;

    themeModeSignal.value = newThemeMode;

    await _settingsService.updateThemeMode(newThemeMode);
    await get<AnalyticsService>().logSetting('themeMode', newThemeMode.name);
  }

  Future<void> loadSettings() async {
    themeModeSignal.value = await _settingsService.themeMode();
  }
}
