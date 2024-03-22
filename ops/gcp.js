#!/usr/bin/env -S deno run
// TODO: CAN WE UPDATE SQL SIZE LATER
//       ADD IN AN OPTION FOR SETTING UP SQL
//       preflight is there an environment example file
import $ from 'https://deno.land/x/dax/mod.ts';
import chalk from 'https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js';

const project = {
  id: '',
  name: '',
  number: '',
  account: '',
  region: 'europe-west1',
  zone: 'europe-west1-d',
  servicesAccount: '',
  configName: '',
};

const run = async () => {
  try {
    await preflight();
    await authenticate();
    await setAccount();
    await selectProject();
    if (!project.id) {
      await createProject();
    }
    await createConfigurations();
    await enableAPIs();
    await createSqlInstance();
  } catch (error) {
    $.logError(error.message);
    return;
  }
  $.logStep('Done!');
};

const createProject = async () => {
  // https://cloud.google.com/sdk/gcloud/reference/projects/create
  $.logStep('Creating a new project');
  project.name = await $.prompt({
    message: 'Project name',
    default: 'Story App',
    noClear: true,
  });

  const defaultId = project.name.toLowerCase().replaceAll(' ', '-');
  project.id = await $.prompt({
    message: 'Project id (6-30 characters)',
    default: defaultId,
    noClear: true,
  });
  // project id must start with a lowercase letter and can have lowercase ASCII letters, digits or hyphens. Project IDs must be between 6 and 30 characters.
  const fresh =
    await $`gcloud projects create ${project.id} --name="${project.name}" --set-as-default --format=json`.json();
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

const selectProject = async () => {
  const projects = await $`gcloud projects list --format=json`.json();
  if (projects.length === 0) return;

  const newProject = 'Create a new project';
  const option = await $.select({
    message: 'Select an existing project or create a new one',
    options: [...projects.map((project) => project.name), newProject],
  });

  if (option == projects.length) return;

  const selectedProject = projects[option];
  project.id = selectedProject.projectId;
  project.name = selectedProject.name;
  project.number = selectedProject.projectNumber;
};

const authenticate = async () => {
  console.log('Log in with your partner services account');
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
};

const createConfigurations = async () => {
  $.logStep('Creating project configurations');

  project.configName = await $.prompt({
    message: 'Configuration name',
    default: project.name,
    noClear: true,
  });

  await $`gcloud config configurations create ${project.configName}`;
  await $`gcloud config configurations activate ${project.configName}`;
  await $`gcloud config set project ${project.id}`;

  project.servicesAccount = await $.prompt({
    message: 'Services account email',
    default: 'services@partner.net',
    noClear: true,
  });

  await $`gcloud config set account ${project.servicesAccount}`;
  await $`gcloud config set compute/region ${project.region}`;
  await $`gcloud config set compute/zone ${project.zone}`;
  $.logStep('Done');
};

const enableAPIs = async () => {
  $.logStep('Enabling necessary APIs');
  await $`gcloud services list --enabled`;
  await $`gcloud services enable run.googleapis.com`;
  await $`gcloud services enable sql-component.googleapis.com`;
  await $`gcloud services enable sqladmin.googleapis.com`;
  await $`gcloud services enable compute.googleapis.com`;
  await $`gcloud services enable cloudbuild.googleapis.com`;
  await $`gcloud services enable secretmanager.googleapis.com`;
  await $`gcloud services enable sourcerepo.googleapis.com`;
  await $`gcloud services enable iam.googleapis.com`;
  $.logStep('Done');
};

const createSqlInstance = async () => {
  $.logStep('Creating a Cloud SQL instance');
  const result = await $.confirm('Do you want to create a SQL instance?');
  if (!result) return;

  const sqlServerVersion = ['MYSQL_8_0', 'MYSQL_5_7', 'POSTGRES_15', 'POSTGRES_14'];
  const instanceName = await $.prompt({
    message: 'SQL instance id (name)',
    default: project.name,
    noClear: true,
  });

  const dbEngine = await $.select({
    message: 'SQL engine',
    default: 'POSTGRES_14',
    options: sqlServerVersion,
    noClear: true,
  });

  const instancePassword = await $.prompt({
    message: 'SQL instance password',
    mask: true,
    noClear: true,
  });
  const chosenVersion = sqlServerVersion[dbEngine];
  // gcloud sql instances create prod-instance --database-version=POSTGRES_9_6 --cpu=2 --memory=8GiB --zone=us-central1-a --root-password=password123
  await $`gcloud sql instances create ${instanceName} --database-version=${chosenVersion} --cpu=1 --memory=4GiB --zone=${project.zone} --root-password=${instancePassword}`;
};

await run();
