import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../settings/settings_screen.dart';

/// Placeholder for home screen
class RootScreen extends StatelessWidget {
  const RootScreen({super.key});

  static const routeName = '/';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New App'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              context.push(SettingsView.routeName);
            },
          ),
        ],
      ),
      body: const Center(
        child: Text('Root Screen'),
      ),
    );
  }
}
