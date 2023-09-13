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
  'analysis_options.yaml',
  '.versionrc',
  'flutter_launcher_icons.yaml',
  'l10n.yaml',
  '.github/workflows/test.yml',
  '_meta/.gitignore',
  'test/store_test.dart',
  'test/doubles/store_double.dart',
  'lib/main.dart',
  'lib/src/app.dart',
  'lib/src/localization/app_en.arb',
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
];

const packages = [
  'firebase_core',
  'firebase_analytics',
  'firebase_crashlytics',
  'get_it',
  'watch_it',
  'go_router',
  'hive',
  'hive_flutter',
  'intl',
];

const recommendedPackages = [
  'flutter_svg|SVG assets',
  'http|api calls',
  'url_launcher|launching links',
];

const devPackages = ['flutter_launcher_icons'];

// Inserts into the pubspec.yaml file
// the value gets inserted just after the line identified by the key
const specTweaks = {
  'dependencies:': '  flutter_localizations:\n    sdk: flutter\n',
  '  uses-material-design: true':
    '\n  generate: true\n\n  assets:\n    - assets/images/\n',
};

const flutterPlatforms = ['ios', 'android', 'web', 'linux', 'macos', 'windows'];

const templatePath =
  'https://raw.githubusercontent.com/OneSheep/scaffolding/main/flutter';

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
  // await copyTemplates();  // testing locally

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

  const defaultBundleId = `org.onesheep.${appName}`;

  const org = await $.prompt('Enter reverse domain for bundle id: ', {
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
  console.log(await $`ls -la`.text());
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
  await $`flutter pub add --dev ${devPackages.join(' ')}`;
};

const fetchTemplates = async () => {
  for (const template of templates) {
    console.log('Fetching template: ', template);
    const content = await $`curl -fsSL ${templatePath}/${template}`.text();
    await Deno.writeTextFile(template, content);
  }
};

const copyTemplates = async () => {
  const devPath = '/Users/jannie/Code/scaffolding/flutter';
  for (const template of templates) {
    // console.log(`cp ${devPath}/${template} ./${template}`);
    await $`cp ${devPath}/${template} ./${template}`;
  }
};

await run();
