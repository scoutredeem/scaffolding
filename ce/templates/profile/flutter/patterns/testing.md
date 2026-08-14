# Testing

## Contents

Read when wrting tests:

- Widget pumps
- Model and service unit tests

## Acceptable Defaults

Use `mocktail` as the default mocking library for unit and widget tests.
Managers should be tested with mocked services so tests validate state updates
and behavior, not real I/O.

```bash
flutter pub add --dev mocktail
```

```dart
class MockCampaignService extends Mock implements CampaignService {}

void main() {
  late MockCampaignService campaignService;
  late CampaignManager manager;

  setUp(() {
    campaignService = MockCampaignService();
    manager = CampaignManager(campaignService);
  });

  test('loads campaigns from service', () async {
    when(() => campaignService.fetchCampaigns()).thenAnswer(
      (_) async => [Campaign(id: '1', title: 'Spring')],
    );

    await manager.loadCampaigns();

    expect(manager.campaigns.length, 1);
    verify(() => campaignService.fetchCampaigns()).called(1);
  });
}
```

For global dependencies resolved via `get<T>()`, register test doubles in
`setUp` and reset `GetIt` in `tearDown` to avoid cross-test contamination.
