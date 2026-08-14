# Error Handling

## Contents

Read when crafting a feature that needs to handle error states:

- Services that are unavailable or broken
- Missing or corrupted cache

## Acceptable Defaults

- In lower layers like services, assume the happy path and let exceptions bubble up to the manager where it is catched
- Catch and rethrow a custom exception at the lower levels if the user feedback requires this detail
- In the catch blocks set the `_errorSignal.value`
- In the widgets watch the error signal and give feedback to the user as appropriate
- Log appropriate firebase crashlytics error logs when the error is not too obvious with appropriate context.
