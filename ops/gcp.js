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
  dbInstance: '',
};

const envVars = [];
const secrets = [];

const run = async () => {
  try {
    await preflight();
    const config = await selectConfig();
    if (!config) {
      await createConfig();
    }
    await authenticate();
    await setAccount();
    await selectProject();
    if (!project.id) {
      await createProject();
    }
    await enableAPIs();
    await populateConfig();
    await createSqlInstance();
    await createDatabase('production');
    await getEnvironment();
    await createSecrets();
    await createCloudRun();
  } catch (error) {
    $.logError(error.message);
    return;
  }

  $.logStep('Done!');
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

const selectConfig = async () => {
  const configs = await $`gcloud config configurations list --format=json`.json();
  if (configs.length === 0) return null;

  const newProject = 'Create a new configuration';
  const option = await $.select({
    message: 'Select an existing project or create a new one',
    options: [...configs.map((project) => project.name), newProject],
  });

  if (option == configs.length) return null;

  const selectedConfig = configs[option];
  // config.current = selectedConfig.name;
  // project.id = selectedConfig.properties.core.project;
  await $`gcloud config configurations activate ${selectedConfig.name}`.quiet();
  return selectedConfig;
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

  try {
    await $`cat Dockerfile`.lines();
  } catch (error) {
    throw new Error('No Dockerfile found in this folder');
  }
};

const populateConfig = async () => {
  $.logStep('Setting up a cli configuration');

  await $`gcloud config set project ${project.id}`.quiet();
  await $`gcloud config set account ${project.account}`.quiet();
  await $`gcloud config set compute/region ${options.region}`.quiet();
  await $`gcloud config set compute/zone ${options.zone}`.quiet();
};

const enableAPIs = async () => {
  const progress = $.progress("Enabling necessary APIs");

  await progress.with(async () => {
    await $`gcloud services enable run.googleapis.com`;
    await $`gcloud services enable compute.googleapis.com`;
    await $`gcloud services enable cloudbuild.googleapis.com`;
    await $`gcloud services enable secretmanager.googleapis.com`;
    await $`gcloud services enable sourcerepo.googleapis.com`;
    await $`gcloud services enable iam.googleapis.com`;
  });
};

const createSqlInstance = async () => {
  // https://cloud.google.com/sdk/gcloud/reference/sql/instances/create
  const result = await $.confirm('Do you want to create a SQL instance?');
  if (!result) return;

  project.dbInstance = await $.prompt({
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
    const instance = await $`gcloud sql instances create ${project.dbInstance} --database-version=${options.dbEngine} --cpu=${options.dbCpu} --memory=${options.dbMemory} --zone=${options.zone} --root-password=${rootPassword} --format=json`.json();
    //   {
    //
    //     backendType: "SECOND_GEN",
    //     connectionName: "al-massira:europe-west1:al-massira",
    //     createTime: "2024-03-27T13:00:49.773Z",
    //     databaseInstalledVersion: "POSTGRES_15_5",
    //     databaseVersion: "POSTGRES_15",
    //     etag: "0a49d235e1bc81f920455c99350a6b27e1d6df4d187ad89a75edcb32af66b656",
    //     gceZone: "europe-west1-d",
    //     instanceType: "CLOUD_SQL_INSTANCE",
    //     ipAddresses: [
    //       { ipAddress: "35.241.168.185", type: "PRIMARY" },
    //       { ipAddress: "35.205.76.144", type: "OUTGOING" }
    //     ],
    //     kind: "sql#instance",
    //     maintenanceVersion: "POSTGRES_15_5.R20240130.00_07",
    //     name: "al-massira",
    //     project: "al-massira",
    //     region: "europe-west1",
    //     selfLink: "https://sqladmin.googleapis.com/sql/v1beta4/projects/al-massira/instances/al-massira",
    //     serverCaCert: {
    //       cert: "-----BEGIN CERTIFICATE-----\n" +
    //         "MIIDfzCCAmegAwIBAgIBADANBgkqhkiG9w0BAQsFADB3MS0wKwYDVQQuEyQ3ZDJl\n" +
    //         "MzhkNS0"... 1172 more characters,
    //       certSerialNumber: "0",
    //       commonName: "C=US,O=Google\\, Inc,CN=Google Cloud SQL Server CA,dnQualifier=7d2e38d5-53f0-4dd3-b86c-bf7a8b63db21",
    //       createTime: "2024-03-27T13:01:49.854Z",
    //       expirationTime: "2034-03-25T13:02:49.854Z",
    //       instance: "al-massira",
    //       kind: "sql#sslCert",
    //       sha1Fingerprint: "e64da056239cfb5ea8d4b28b24f98708c4afa568"
    //     },
    //     serviceAccountEmailAddress: "p79323891240-n3o822@gcp-sa-cloud-sql.iam.gserviceaccount.com",
    //     settings: {
    //       activationPolicy: "ALWAYS",
    //       availabilityType: "ZONAL",
    //       backupConfiguration: {
    //         backupRetentionSettings: { retainedBackups: 7, retentionUnit: "COUNT" },
    //         enabled: false,
    //         kind: "sql#backupConfiguration",
    //         startTime: "00:00",
    //         transactionLogRetentionDays: 7,
    //         transactionalLogStorageState: "TRANSACTIONAL_LOG_STORAGE_STATE_UNSPECIFIED"
    //       },
    //       connectorEnforcement: "NOT_REQUIRED",
    //       dataDiskSizeGb: "10",
    //       dataDiskType: "PD_SSD",
    //       deletionProtectionEnabled: false,
    //       ipConfiguration: {
    //         ipv4Enabled: true,
    //         requireSsl: false,
    //         sslMode: "ALLOW_UNENCRYPTED_AND_ENCRYPTED"
    //       },
    //       kind: "sql#settings",
    //       locationPreference: { kind: "sql#locationPreference", zone: "europe-west1-d" },
    //       pricingPlan: "PER_USE",
    //       replicationType: "SYNCHRONOUS",
    //       settingsVersion: "1",
    //       storageAutoResize: true,
    //       storageAutoResizeLimit: "0",
    //       tier: "db-custom-1-4096"
    //     },
    //     sqlNetworkArchitecture: "NEW_NETWORK_ARCHITECTURE",
    //     state: "RUNNABLE"
    //   }
  });

  await $`gcloud projects add-iam-policy-binding ${project.id} --member serviceAccount:${project.number}@cloudbuild.gserviceaccount.com --role roles/cloudsql.client`.quiet();
};

const createDatabase = async (name) => {
  const progress = $.progress(`Creating ${name} database and user`);
  await progress.with(async () => {
    const db = await $`gcloud sql databases create ${name} --instance=${project.dbInstance} --format=json`.json();

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
};

const createCloudRun = async () => {
  $.logStep('Creating a Cloud Run service');

  const service = await $.prompt({
    message: 'Service name',
    default: 'production',
    noClear: true,
  });

  const env = envVars.map((item) => `--set-env-vars "${item.key}=${item.value}"`);
  const sec = secrets.map((item) => `--set-secrets ${item.key}=${item.key}:1`);

  const lines = [
    `gcloud run deploy ${service}`,
    `--source .`,
    `--project=${project.id}`,
    `--region=${options.region}`,
    `--allow-unauthenticated`,
    ...env,
    ...sec,
    `--format=json`
  ];

  const progress = $.progress('Deploying the service');
  await progress.with(async () => {
    const result = await $`${lines.join(' ')}`.json();
    console.log(result);
  });
};

await run();
