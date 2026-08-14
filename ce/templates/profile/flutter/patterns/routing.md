# Routing

## Contents

Read when planning navigation:

- New screen
- Deep linking to a page
- Wiring in an authentication gate
- Planning screen transitions

## Acceptable Defaults

- Use the `go_router` package for routing
- All routes live in `lib/src/shared/routes.dart`
- Define route paths as static constants on screen widgets:

```dart
class HomeScreen extends StatelessWidget {
  static const routePath = '/';
}
```

Typical structure with bottom navigation shell and onboarding gate:

```dart
final GoRouter routes = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: _getInitialLocation(),
  routes: [
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) => BottomNavScaffold(child: child),
      routes: [
        GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
        GoRoute(path: '/discover', builder: (_, __) => const DiscoverScreen()),
      ],
    ),
    // Routes that push over the shell use parentNavigatorKey: _rootNavigatorKey
    GoRoute(
      path: '/detail',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (_, __) => const DetailScreen(),
    ),
  ],
);

String _getInitialLocation() {
  if (!get<StoreService>().onboardingCompleted) return OnboardScreen.routePath;
  return HomeScreen.routePath;
}
```

Navigation:

```dart
context.go('/discover');     // Replace stack — use for tab switching
context.push('/detail');     // Push on top — use for drilling into content
context.pop(true);           // Pop with return value
```
