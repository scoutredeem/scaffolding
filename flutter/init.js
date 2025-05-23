#!/usr/bin/env -S deno run

import $ from 'https://deno.land/x/dax/mod.ts';
import chalk from 'https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js';

const rootFolders = [
  '_meta',
  'assets/fonts',
  'assets/images',
  'assets/icons',
  '.github/workflows',
  'lib/src/shared/services',
  'lib/src/localization',
  'lib/src/navigation',
  'lib/src/settings',
  'test/doubles',
];

const templates = [
  'README.md',
  'Makefile',
  'analysis_options.yaml',
  '.versionrc',
  'flutter_launcher_icons.yaml',
  'l10n.yaml',
  '.github/workflows/test.yml',
  '_meta/.gitignore',
  'test/store_test.dart',
  'test/doubles/store_double.dart',
  'test/widget_test.dart',
  'lib/main.dart',
  'lib/src/app.dart',
  'lib/src/localization/app_en.arb',
  'lib/src/localization/.gitignore',
  'lib/src/navigation/root_screen.dart',
  'lib/src/settings/settings_manager.dart',
  'lib/src/settings/settings_screen.dart',
  'lib/src/settings/settings_service.dart',
  'lib/src/shared/styles.dart',
  'lib/src/shared/extensions.dart',
  'lib/src/shared/routes.dart',
  'lib/src/shared/services/analytics_service.dart',
  'lib/src/shared/services/crashlytics_service.dart',
  'lib/src/shared/services/service_locator.dart',
  'lib/src/shared/services/store_service.dart',
  '.cursorrules'
];

const packages = [
  'firebase_core',
  'firebase_analytics',
  'firebase_crashlytics',
  'get_it',
  'signals',
  'go_router',
  'hive',
  'hive_flutter',
  'intl',
];

const recommendedPackages = [
  'flutter_svg|SVG assets',
  'http|api calls',
  'url_launcher|launching links',
  'google_fonts|Google Fonts',
];

const devPackages = ['flutter_launcher_icons', 'dart_style'];

// Inserts into the pubspec.yaml file
// the value gets inserted just after the line identified by the key
const specTweaks = {
  'dependencies:': '  flutter_localizations:\n    sdk: flutter\n',
  '  uses-material-design: true':
    '\n  generate: true\n\n  assets:\n    - assets/images/\n',
};

const flutterPlatforms = ['ios', 'android', 'web', 'linux', 'macos', 'windows'];

const templatePath =
  'https://raw.githubusercontent.com/scoutredeem/scaffolding/main/flutter';

// for local testing
// const templatePath = '/Users/paurakh/projects/scoutredeem/scout-redeem-repos/scaffolding/flutter';

let collectedPackages = [];
let chosenPackages = [];
let collectedPlatforms = [];

const run = async () => {
  $.verbose = false;
  console.log(chalk.black.bgGreenBright.bold('\n  New Flutter app! 🕶  \n'));

  await createApp();

  await makeFolders();

  console.log(`Installing dev packages ...`);
  await installDevPackages();

  await installPackages();

  console.log(`Fetching templates ...`);
  await fetchTemplates();

  console.log(`Tweaking templates ...`);
  await tweakTemplates();

  console.log(chalk`To set up firebase, run: {bold flutterfire configure}`);

  console.log(chalk.green(`\nReady!  🚀 `));
};

const tweakTemplates = async () => {
  for (const [key, value] of Object.entries(specTweaks)) {
    const cmd = `/^${key}\n/ and $_.="${value}"`;
    await $`perl -pi -e ${cmd} pubspec.yaml`;
  }
};

const createApp = async () => {
  const appName = await $.prompt(
    'Right, what shall we call it? Enter a valid package name: ',
    { default: 'test_app', noClear: true },
  );

  const defaultBundleId = `co.scoutredeem`;

  const org = await $.prompt('Enter reverse org domain: ', {
    default: defaultBundleId,
    noClear: true,
  });

  const flutterPlatformIndexes = await $.multiSelect({
    message: 'What platforms are we targeting?',
    options: flutterPlatforms,
    noClear: true,
  });

  collectedPlatforms = flutterPlatformIndexes.map((index) => flutterPlatforms[index]);

  const packagesIndexes = await $.multiSelect({
    message: 'What packages will the app need?',
    options: recommendedPackages,
    noClear: true,
  });

  chosenPackages = packagesIndexes.map((index) => recommendedPackages[index]);

  chosenPackages.forEach((element) => {
    collectedPackages.push(element.split('|')[0]);
  });

  if (org == '') org = defaultBundleId;

  let path = (await $`pwd`.text()).split('\n')[0];

  console.log(`\nCreating app in ${path}/${appName} ...`);
  const platforms = collectedPlatforms.join(',');
  console.log(platforms);
  // flutter create--org org.onesheep.test - t app--platforms ios, android mini
  await $`flutter create --org ${org} -t app --platforms ${platforms} ${appName}`;

  await $.cd(`${path}/${appName}`);
};

const makeFolders = async () => {
  for (const folder of rootFolders) {
    await $`mkdir -p ${folder}`;
  }
};

const installPackages = async () => {
  for (const p of packages) {
    await $`flutter pub add ${p}`;
  }

  for (const p of collectedPackages) {
    await $`flutter pub add ${p}`;
  }
};

const installDevPackages = async () => {
  for (const p of devPackages) {
    await $`flutter pub add --dev ${p}`;
  }
};

const fetchTemplates = async () => {
  for (const template of templates) {
    console.log('Fetching template: ', template);

    let content = '';

    if (templatePath.startsWith('http')) {  // remote
      content = await $`curl -fsSL ${templatePath}/${template}`.text();
    } else {  // local
      content = await Deno.readTextFile(`${templatePath}/${template}`);
    }

    await Deno.writeTextFile(template, content);
  }
};

await run();
