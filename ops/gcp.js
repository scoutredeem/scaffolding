#!/usr/bin/env -S deno run

import $ from 'https://deno.land/x/dax/mod.ts';
import chalk from 'https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js';

const options = {
  region: 'europe-west1',
  zone: 'europe-west1-d',
  dbEngine: 'POSTGRES_15',
  dbCpu: 1,
  dbMemory: '4GiB',
}

const prodEnvironment = [
  'PORT',
  'HOST=0.0.0.0',
  'NODE_ENV=production',
  'DRIVE_DISK=local',
  'SESSION_DRIVER=cookie',
  'CACHE_VIEWS=true',
  'DB_CONNECTION=pg',
  'PG_PORT=5432',
  'PG_DB_NAME=production',
  'SMTP_HOST=smtp.eu.mailgun.org',
  'SMTP_PORT=587',
];

const project = {
  id: '',
  name: '',
  number: '',
  account: '',
};

const envVars = [];
const secrets = [];

const run = async () => {
  try {
    await preflight();
    await createConfig();
    await authenticate();
    await setAccount();
    await createProject();
    await populateConfig();
    await enableAPIs();
    await createSqlInstance();
    await createDatabase('production');
    await getEnvironment();
    await createSecrets();
  } catch (error) {
    $.logError(error.message);
    return;
  }

  $.logStep('Done!');
};

const createConfig = async () => {
  $.logStep('Creating a new project');
  project.name = await $.prompt({
    message: 'Project name',
    default: 'Story App',
    noClear: true,
  });

  // project id must start with a lowercase letter and can have lowercase ASCII letters, digits or hyphens. Project IDs must be between 6 and 30 characters.
  const defaultId = project.name.toLowerCase().replaceAll(' ', '-');
  project.id = await $.prompt({
    message: 'Project id (6-30 characters)',
    default: defaultId,
    noClear: true,
  });

  await $`gcloud config configurations create ${project.id}`.quiet();
  await $`gcloud config configurations activate ${project.id}`.quiet();
};

const createProject = async () => {
  // https://cloud.google.com/sdk/gcloud/reference/projects/create

  const fresh =
    await $`gcloud projects create ${project.id} --name="${project.name}" --format=json`.json();
  // {
  //     "@type": "type.googleapis.com/google.cloudresourcemanager.v1.Project",
  //     createTime: "2024-03-19T20:00:11.417080Z",
  //     lifecycleState: "ACTIVE",
  //     name: "'Temporary Test'",
  //     parent: { id: "877170385875", type: "organization" },
  //     projectId: "temporary-test-082",
  //     projectNumber: "963664183424"
  // }
  project.number = fresh.projectNumber;
};

const authenticate = async () => {
  $.logStep('Log in with your partner services account');
  try {
    await $`gcloud auth login`;
  } catch (error) {
    throw new Error('Failed to authenticate with gcloud.');
  }
};

const setAccount = async () => {
  const accounts = await $`gcloud auth list --format=json`.json();
  const active = accounts.find((account) => account.status === 'ACTIVE');
  if (!active) {
    throw new Error('No active account found. Please log in with gcloud.');
  }

  project.account = active.account;

  const billing = await $`gcloud billing accounts list --format=json`.json();
  if (billing.length === 0) {
    throw new Error('No billing account found. Please set up billing for your account.');
  }
};

const preflight = async () => {
  try {
    await $`which gcloud`.text();
  } catch (error) {
    throw new Error('gcloud is not installed.');
  }

  let lines = [];
  try {
    lines = await $`cat .env.example`.lines();
  } catch (error) {
    throw new Error('No .env.example file found in this folder');
  }
  if (lines.length < 2) {
    throw new Error('.env.example file looks empty');
  }
};

const populateConfig = async () => {
  $.logStep('Setting up a cli configuration');

  await $`gcloud config set project ${project.id}`.quiet();
  await $`gcloud config set account ${project.account}`.quiet();
  await $`gcloud config set compute / region ${options.region}`.quiet();
  await $`gcloud config set compute/zone ${options.zone}`.quiet();
};

const enableAPIs = async () => {
  $.logStep('Enabling necessary APIs');

  await $`gcloud services enable run.googleapis.com`.quiet();
  await $`gcloud services enable compute.googleapis.com`.quiet();
  await $`gcloud services enable cloudbuild.googleapis.com`.quiet();
  await $`gcloud services enable secretmanager.googleapis.com`.quiet();
  await $`gcloud services enable sourcerepo.googleapis.com`.quiet();
  await $`gcloud services enable iam.googleapis.com`.quiet();
};


const createSqlInstance = async () => {
  // https://cloud.google.com/sdk/gcloud/reference/sql/instances/create
  const result = await $.confirm('Do you want to create a SQL instance?');
  if (!result) return;

  const instanceId = await $.prompt({
    message: 'SQL instance id',
    default: project.id,
    noClear: true,
  });

  const rootPassword = await $.prompt({
    message: 'Root password',
    mask: true,
    noClear: true,
  });

  const progress = $.progress("Creating a Cloud SQL instance");
  await progress.with(async () => {
    await $`gcloud services enable sql-component.googleapis.com`.quiet();
    await $`gcloud services enable sqladmin.googleapis.com`.quiet();
    // --assign-ip
    const instance = await $`gcloud sql instances create ${instanceId} --database-version=${options.dbEngine} --cpu=${options.dbCpu} --memory=${options.dbMemory} --zone=${options.zone} --root-password=${rootPassword} --format=json`.json();
    console.log(instance);
  });

  await $`gcloud projects add-iam-policy-binding ${project.id} --member serviceAccount:${project.number}@cloudbuild.gserviceaccount.com --role roles/cloudsql.client`.quiet();
};

const createDatabase = async (name) => {
  const progress = $.progress(`Creating ${name} database and user`);
  await progress.with(async () => {
    const db = await $`gcloud sql databases create ${name} --instance=${instanceId} --format=json`.json();
    console.log(db);
    // TODO: CREATE USER
  });
};

const getEnvironment = async () => {
  const defaults = prodEnvironment.map((line) => {
    const [key, start] = line.split('=');
    return { key, value: start };
  });
  const ignoreList = defaults.filter((item) => !item.value).map((item) => item.key);
  console.log(ignoreList);

  const pairs = await $`cat .env.example`.lines();
  for (const pair of pairs) {
    const [key, start] = pair.split('=');
    if (ignoreList.includes(key)) continue;

    const spec = defaults.find((item) => item.key === key);

    const value = await $.prompt({
      message: key,
      default: spec?.value ?? start,
      noClear: true,
    })
    const isSecret = await $.confirm({ message: 'Is this a secret?', default: false });
    if (isSecret) {
      secrets.push({ key, value });
    } else {
      envVars.push({ key, value });
    }
  }
};

const createSecrets = async () => {
  $.logStep('Creating secrets');

  for (const secret of secrets) {
    await $`gcloud secrets create ${secret.key} --data-file=-`.stdin(secret.value);
  }

  // Authorise the compute and cloud build service accounts to access our secrets:
  const accounts = [
    `${project.number}-compute@developer.gserviceaccount.com`,
    `${project.number}@cloudbuild.gserviceaccount.com`,
  ];

  for (const account of accounts) {
    await $`gcloud projects add-iam-policy-binding ${project.id} --member=serviceAccount:${account} --role=roles/secretmanager.secretAccessor`.quiet();
  }
}



await run();
