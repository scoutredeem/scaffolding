#!/usr/bin/env -S deno run

import $ from 'https://deno.land/x/dax/mod.ts';

const options = {
  region: 'europe-west1',
  zone: 'europe-west1-d',
  dbEngine: 'POSTGRES_15',
  dbCpu: 1,
  dbMemory: '4GiB',
}

const prodEnvironment = [
  'PORT',
  // adonis
  'HOST=0.0.0.0',
  'NODE_ENV=production',
  'DRIVE_DISK=local',
  'SESSION_DRIVER=cookie',
  'CACHE_VIEWS=true',
  'DB_CONNECTION=pg',
  'PG_PORT=5432',
  'PG_USER=postgres',
  'SMTP_HOST=smtp.eu.mailgun.org',
  'SMTP_PORT=587',
  // strapi
  'DATABASE_PORT=5432',
  'DATABASE_USERNAME=postgres',
  'DATABASE_SSL=true',
];

const project = {
  id: '',
  name: '',
  number: '',
  account: '',
  dbInstance: '',
};

const database = {
  instance: '',
  connection: '',
  name: '',
  user: '',
  password: '',
  address: '',
}

const envVars = [];
const secrets = [];

const run = async () => {
  try {
    await getEnvironment();

    await preflight();
    const config = await selectConfig();
    if (!config) {
      await createConfig();
    }
    // await authenticate();
    await setAccount();
    await selectProject();
    if (!project.id) {
      await createProject();
    }
    // await populateConfig();
    // await enableAPIs();

    await selectSqlInstance();
    if (!database.instance) {
      await createSqlInstance();
    }

    if (database.instance) {
      await setSqlAccess();
      await selectDabase();
      if (!database.name) {
        await createDatabase();
      }
    }

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
  $.log('Log in with your partner services account');
  try {
    await $`gcloud auth login`;
  } catch (error) {
    throw new Error('Failed to authenticate with gcloud.');
  }
};

const setAccount = async () => {
  $.log('Checking the account and billing');
  $.logGroup();
  const accounts = await $`gcloud auth list --format=json`.json();
  const active = accounts.find((account) => account.status === 'ACTIVE');
  if (!active) {
    throw new Error('No active account found. Please log in with gcloud.');
  }
  $.logLight(`✓ account ${active.account} is active`);

  project.account = active.account;

  const billing = await $`gcloud billing accounts list --format=json`.json();
  if (billing.length === 0) {
    throw new Error('No billing account found. Please set up billing for your account.');
  }
  $.logLight(`✓ billing is set`);
  $.logGroupEnd();
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
  $.log('Setting up a cli configuration');
  $.logGroup();
  await $`gcloud config set project ${project.id}`.quiet();
  $.logLight(`✓ project name set to ${project.id}`);
  await $`gcloud config set account ${project.account}`.quiet();
  $.logLight(`✓ project account set to ${project.account}`);
  $.logLight(`enabling compute API ...`);
  await $`gcloud services enable compute.googleapis.com`.quiet();
  $.logLight(`✓ compute API enabled`);
  await $`gcloud config set compute/region ${options.region}`.quiet();
  $.logLight(`✓ project region set to ${options.region}`);
  await $`gcloud config set compute/zone ${options.zone}`.quiet();
  $.logLight(`✓ project zone set to ${options.zone}`);
  $.logGroupEnd();
};

const enableAPIs = async () => {
  $.log('Enabling necessary APIs');
  $.logGroup();
  await $`gcloud services enable run.googleapis.com`;
  $.logLight(`✓ Cloud Run enabled`);
  await $`gcloud services enable cloudbuild.googleapis.com`;
  $.logLight(`✓ Cloud Build enabled`);
  await $`gcloud services enable secretmanager.googleapis.com`;
  $.logLight(`✓ Secret Manager enabled`);
  await $`gcloud services enable sourcerepo.googleapis.com`;
  $.logLight(`✓ Source Repo enabled`);
  await $`gcloud services enable iam.googleapis.com`;
  $.logLight(`✓ IAM enabled`);
  await $`gcloud services enable sqladmin.googleapis.com`;
  $.logLight(`✓ SQL enabled`);
  $.logGroupEnd();

};

const createSqlInstance = async () => {
  // https://cloud.google.com/sdk/gcloud/reference/sql/instances/create
  const result = await $.confirm('Do you want to create a SQL instance?');
  if (!result) return;

  database.instance = await $.prompt({
    message: 'SQL instance id',
    default: project.id,
    noClear: true,
  });

  const rootPassword = await $.prompt({
    message: 'Root password',
    mask: true,
    noClear: true,
  });

  $.log("Creating a Cloud SQL instance");
  $.logGroup();
  await $`gcloud services enable sql-component.googleapis.com`.quiet();
  $.logLight(`✓ SQL component enabled`);
  await $`gcloud services enable sqladmin.googleapis.com`.quiet();
  $.logLight(`✓ SQL admin enabled`);
  $.logLight(`Creating the instance. This takes a few minutes.`);
  const instance = await $`gcloud sql instances create ${database.instance} --database-version=${options.dbEngine} --cpu=${options.dbCpu} --memory=${options.dbMemory} --zone=${options.zone} --root-password=${rootPassword} --format=json`.json();
  database.connection = instance.connectionName;
  database.address = instance.ipAddresses[0].ipAddress;
  $.logLight(`✓ instance created and running at ${database.address}`);
  $.logGroupEnd();
};

const setSqlAccess = async () => {
  $.log("Giving Cloud Build access to the database");
  $.logGroup();
  await $`gcloud projects add-iam-policy-binding ${project.id} --member serviceAccount:${project.number}@cloudbuild.gserviceaccount.com --role roles/cloudsql.client`.quiet();
  $.logLight(`✓ access granted`);
  $.logGroupEnd();
};

const selectSqlInstance = async () => {
  const instances = await $`gcloud sql instances list --format=json`.json();
  if (instances.length === 0) return null;

  const newProject = 'Create a new instance';
  const option = await $.select({
    message: 'Select an existing Postgres instance or create a new one',
    options: [...instances.map((instance) => instance.name), newProject],
  });

  if (option == instances.length) return null;

  const selectedInstance = instances[option];
  database.instance = selectedInstance.name;
  return selectedInstance;
}

const selectDabase = async () => {
  const databases = await $`gcloud sql databases list --instance=${database.instance} --format=json`.json();
  if (databases.length === 0) return null;

  const newDatabase = 'Create a new database';
  const option = await $.select({
    message: 'Select an existing database or create a new one',
    options: [...databases.map((db) => db.name), newDatabase],
  });

  if (option == databases.length) return null;

  const selectedDatabase = databases[option];
  database.name = selectedDatabase.name;
  return selectedDatabase;
}

const createDatabase = async () => {
  database.name = await $.prompt({
    message: 'Database name',
    default: 'production',
    noClear: true,
  });

  $.log(`Creating ${database.name} database and user`);
  $.logGroup();
  await $`gcloud sql databases create ${database.name} --instance=${database.instance} --format=json`.json();
  // { instance: "gnfe-app", name: "production", project: "gnfe-app" }
  $.logLight(`✓ database created`);
  $.logGroupEnd();
  // database.user = `${database.name}`;

  // const database.password = await $.prompt({
  //   message: `Db user ${database.user} password`,
  //   mask: true,
  //   noClear: true,
  // });

  // const result = await $`gcloud sql users create ${database.user} --instance=${database.instance} --password=${database.password} --format=json`.json();
};

const getEnvironment = async () => {
  $.log('Collecting the environment variables');

  const prodDefaults = prodEnvironment.map((line) => {
    const [key, start] = line.split('=');
    return { key, value: start };
  });

  const ignoreList = prodDefaults.filter((item) => !item.value).map((item) => item.key);

  const pairs = await $`cat .env.example`.lines();
  for (const pair of pairs) {
    const [key, start] = pair.split('=');
    if (!key || key[0] === '#') continue;
    if (ignoreList.includes(key)) continue;

    const value = await $.prompt({
      message: key,
      default: getDefault(key, start, prodDefaults),
      noClear: true,
    })
    const isSecret = await $.confirm({ message: 'Is this a secret?', default: looksSecretive(key) });
    if (isSecret) {
      secrets.push({ key, value });
    } else {
      envVars.push({ key, value });
    }
  }
};

const looksSecretive = (key) => {
  const secretive = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN', 'SALT', 'HASH', 'CRYPT', 'PRIVATE', 'CERT', 'PEM', 'SSL', 'AUTH', 'PASS', 'PIN', 'CODE', 'CIPHER',];
  return secretive.some((item) => key.toUpperCase().includes(item));
}

const getDefault = (key, start, prodDefaults) => {
  const spec = prodDefaults.find((item) => item.key === key);
  if (spec) {
    return spec.value;
  }

  switch (key) {
    case 'PG_HOST':
    case 'DATABASE_HOST':
      return `/cloudsql/${database.connection}`;

    case 'PG_DB_NAME':
    case 'DATABASE_NAME':
      return database.name;

    case 'PG_PASSWORD':
    case 'DATABASE_PASSWORD':
      return database.password;

    case 'PG_USER':
    case 'DATABASE_USERNAME':
      return database.user;

    default:
      break;
  }

  return start;
}

const createSecrets = async () => {
  $.log('Creating secrets');
  $.logGroup();

  for (const secret of secrets) {
    await $`gcloud secrets create ${secret.key} --data-file=-`.stdin(secret.value);
    $.logLight(`✓ ${secret.key} created`);
  }

  // Authorise the compute and cloud build service accounts to access our secrets:
  const accounts = [
    `${project.number}-compute@developer.gserviceaccount.com`,
    `${project.number}@cloudbuild.gserviceaccount.com`,
  ];

  for (const account of accounts) {
    await $`gcloud projects add-iam-policy-binding ${project.id} --member=serviceAccount:${account} --role=roles/secretmanager.secretAccessor`.quiet();
    $.logLight(`✓ ${account} authorized`);
  }
  $.logGroupEnd();
};

const createCloudRun = async () => {
  $.log('Creating a Cloud Run service');

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
