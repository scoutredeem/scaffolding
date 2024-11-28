import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart' show kDebugMode;

class AnalyticsService {
  late FirebaseAnalytics _analytics;

  AnalyticsService() {
    _analytics = FirebaseAnalytics.instance;
    _analytics.setAnalyticsCollectionEnabled(!kDebugMode);
    // _analytics.setAnalyticsCollectionEnabled(true); // for testing
  }

  Future<void> logSetting(String item, String value) async {
    await _analytics.logEvent(
      name: 'setting',
      parameters: <String, Object>{
        'item': item,
        'value': value,
      },
    );
  }
}
