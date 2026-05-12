# <Project Name Goes Here>

## Setup

For setting up the Dart SDK and Flutter, see the
[official documentation](https://flutter.io/)

Setup git hooks for commit message linting:

```
make setup-hooks
```

To set up Firebase, run the following using your specific bundle id:

```
firebase login
flutterfire configure -i your.ios.bundle-id.here -a your.android.package.name.here
```

Or log in to the project firebase console and download the firebase config files for
Android and iOS. Put the two files here:

```
android/app/google-services.json
ios/Runner/GoogleService-Info.plist
```

## Test

To run all unit and widget tests:

```
flutter test test/
```

## Release

Update the release version number in pubspec.yaml, for example:

```
version: 0.2.2+5
```

Update the changelog with:

```
npx standard-version -- --release-as 8.4.5
```

The version should be tagged and shared as soon as a build is submitted for public
release.

## Deployment (Flutter web via GitHub Actions + Cloudflare Pages)

- PR previews: `.github/workflows/pr_deploy.yml` runs on every pull request. It builds the web app and deploys a Cloudflare Pages preview using the PR branch name as the preview branch/subdomain.
- Staging: `.github/workflows/staging_deploy.yml` runs on pushes to `main`. It builds the web app and deploys to the Pages `staging` branch. Slack is notified on success/failure.
- Production: `.github/workflows/production_deploy.yml` runs on tag pushes matching `v*.*.*` and only proceeds when the tag contains a `+` (e.g. `v1.2.3+45`). It builds and deploys using the `main` branch content. Slack is notified on success/failure.
- Required GitHub Action secrets: `CLOUDFLARE_API_TOKEN`, `FIREBASE_OPTIONS_DART` (base64 of `lib/firebase_options.dart`), `DOT_ENV` (base64 of `.env`), `SLACK_REDEEM_BOT_URL` (incoming webhook), and the repo-provided `GITHUB_TOKEN`.
- Release deploy example: `git tag v1.2.3+45 && git push origin v1.2.3+45` to trigger production deployment.

### App localisation

To add a new language, say Spanish:

1. add a translation file called `lib/src/localization/app_es.arb`
2. add the language to the `supportedLocales` list in `lib/src/app.dart`

Every time you build your app, an up-to-date app_localizations.dart file is generated in
the untracked `.dart_tool/flutter_gen/gen_l10n` folder so that the new strings and
functions become available on the build context for you to reference.

The widely used "Application Resource Bundles" format is basically just json with some
standard conventions to add meta-data to translation phrases. For example, a phrase that
takes a parameter could be specified as follows:

```
{
    "greeting": "Morning {name}!",
    "@greeting": {
        "description": "Greet the user by their name.",
        "placeholders": {
            "name": {
                "type": "String",
                "example": "Jane"
            }
        }
    }
}
```

For more detail on formatting localized dates, numbers and plurals see [the docs][3]

[3]: https://ishort.ink/owwv
