## Workflow and Branching

![mobile](https://res.cloudinary.com/kiekies/image/upload/v1740044707/%27%27/cv2iwfytb3ffo8a4exti.svg)

## Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to
standardize commit messages. Commit types can be one of the following:

- `feat`: A new feature
- `fix`: A bug fix
- `increment`: A functional improvement that is not a feat or a fix
- `ops`: Non-functional code changes needed to build or deploy the app (chore, ci, build)
- `qa`: Non-functional changes to improve understanding and assurance (tests, docs)
- `refactor`: Non-functional changes that improve maintainability and efficiency

## Architecture

- The app source code is in the lib folder and organised by feature. That means where
  possible the root folders are feature folders that holds the models, managers and
  widgets needed for that feature except for the `shared` folder.
- Models, services, widgets and utilities that are used all across the app are located in
  the `shared` folder.
- The app is crafted along an MVVM architecture:
- `M`: models and services do not depend on any other part of the app. A service can
  reference models and other services, but not cyclical. Services are registered in the
  central `service_locator.dart` and have a `_service` filename suffix.
- `V`: page and component widgets are driven by view managers and can also depend directly
  on models and services. Page widgets have a `_screen` filename suffix.
- `VM`: view managers are the glue between the view and the base model/service layer. They
  can depend on the `M` layer, but not the `V` layer. Managers are responsible for
  updating the view and reacting to user input and other events via reactive Signal
  properties. They are registered in the service locator as a lazy loading singleton and
  have a `_manager` filename suffix.
