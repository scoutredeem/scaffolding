# Services

## Contents

Read whenever you need to use a service:

- Wrap an SDK or package to provide a uniform API
- Interface with external API via a http client
- Reading or writing to the local data store
- Device API's

## Acceptable Defaults

- Keep services focused — one concern per service.
- Register them as lazy loaded singletons in the service locator
- Avoid cyclical dependencies
- Services live with models at the bottom of the architecture. Never import higher level elements like managers or widgets into services.
