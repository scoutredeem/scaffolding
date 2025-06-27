#!/usr/bin/env -S deno run

import $ from 'jsr:@david/dax@0.40.0';

const options = {
  region: 'europe-west1',
  zone: 'europe-west1-d',
  dbEngine: 'POSTGRES_15',
  dbCpu: 1,
  dbMemory: '4GiB',
};

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

const neededApis = [
  'run.googleapis.com',
  'cloudbuild.googleapis.com',
  'secretmanager.googleapis.com',
  // 'sourcerepo.googleapis.com', // this is unavailable since June 17, 2024
  'iam.googleapis.com',
  'sqladmin.googleapis.com',
];

const project = {
  id: '',
  name: '',
  number: '',
  account: '',
};

const database = {
  instance: '',
  connection: '',
  name: '',
  address: '',
  user: 'postgres',
  password: '',
};

const envVars = [];
const secrets = [];

let enabledApis = [];
let cloudRun = '';

const run = async () => {
  try {
    if (Deno.args.includes('--help')) {
      printHelp();
      return;
    }

    await preflight();
    await setProject();

    const action = await $.select({
      message: `With project ${project.id}, what do you want to do?`,
      options: [
        'Create a cloud run service',
        'Create a build trigger',
        'Create a secret',
        'Create a load balancer',
      ],
    });

    switch (action) {
      case 0:
        await selectSqlInstance();
        if (!database.instance) {
          await createSqlInstance();
        }

        if (database.instance) {
          await selectDabase();
          if (!database.name) {
            await createDatabase();
          }
        }

        await getEnvironment();
        await createSecrets();
        await setCloudRun();
        break;

      case 1:
        const build = new Build(project);
        await build.createTrigger();

        break;

      case 2:
        await createNewSecret();
        break;

      case 3:
        await createLoadBalancer();
        break;

      default:
        break;
    }
  } catch (error) {
    $.logError(error.message);
    return;
  }

  report();
};

const printHelp = () => {
  $.log('Usage: gcp [options]');
  $.log('Options can be:');
  $.log('--help     : print this help message');
  $.log('--skip-auth: the cli is already authenticated, use the active config');
};

const preflight = async () => {
  try {
    await $`which gcloud`.text();
  } catch (error) {
    throw new Error('gcloud is not installed.');
  }
};

const setProject = async () => {
  if (Deno.args.includes('--skip-auth')) {
    $.log('Setting the active project');
    $.logGroup();
    const configs = await $`gcloud config configurations list --format=json`.json();
    const active = configs.find((config) => config.is_active);
    if (!active) {
      throw new Error('No active gcloud configuration found.');
    }

    project.id = active.properties.core.project;
    project.account = active.properties.core.account;
    $.logLight(`fetching ${project.id}`);
    const projects = await $`gcloud projects list --format=json`.json();
    const selectedProject = projects.find((item) => item.projectId === project.id);
    project.name = selectedProject.name;
    project.number = selectedProject.projectNumber;
    $.logLight(`using ${project.name}`);
    $.logGroupEnd();
    return;
  }

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
  await populateConfig();
  await enableAPIs();
};

const preflightCloudRun = async () => {
  let lines = [];
  try {
    lines = await $`cat .env`.lines();
  } catch (error) {
    throw new Error('No .env file found in this folder');
  }

  if (lines.length < 2) {
    throw new Error('.env file looks empty');
  }

  try {
    await $`cat Dockerfile`.lines();
  } catch (error) {
    throw new Error('No Dockerfile found in this folder');
  }
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
  $.log('Creating a new project');
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

const populateConfig = async () => {
  $.log('Setting up a cli configuration');
  $.logGroup();

  const active = await $`gcloud config list --format=json`.json();
  if (active.core.project !== project.id) {
    await $`gcloud config set project ${project.id}`.quiet();
    $.logLight(`✓ project name set to ${project.id}`);
  }

  if (active.core.account !== project.account) {
    await $`gcloud config set account ${project.account}`.quiet();
    $.logLight(`✓ project account set to ${project.account}`);
  }

  $.logLight(`checking enabled services ...`);
  const enabled = await $`gcloud services list --enabled --format=json`.json();
  enabledApis = enabled.map((service) => service.config.name);

  if (!enabledApis.includes('compute.googleapis.com')) {
    $.logLight(`enabling compute API ...`);
    await $`gcloud services enable compute.googleapis.com`.quiet();
    $.logLight(`✓ compute API enabled`);

    const account = `${project.number}-compute@developer.gserviceaccount.com`;
    await $`gcloud projects add-iam-policy-binding ${project.id} --member=serviceAccount:${account} --role=roles/secretmanager.secretAccessor`;
    $.logLight(`✓ ${account} authorized to access secrets`);
  }

  if (active.compute?.region !== options.region) {
    await $`gcloud config set compute/region ${options.region}`.quiet();
    $.logLight(`✓ project region set to ${options.region}`);
  }
  if (active.compute?.zone !== options.zone) {
    await $`gcloud config set compute/zone ${options.zone}`.quiet();
    $.logLight(`✓ project zone set to ${options.zone}`);
  }
  $.logGroupEnd();
};

const enableAPIs = async () => {
  $.log('Enabling necessary APIs');
  $.logGroup();

  for (const api of neededApis) {
    $.log(`attempting to enable ${api} ...`);
    if (enabledApis.includes(api)) {
      $.logLight(`✓ ${api} is enabled`);
    } else {
      await $`gcloud services enable ${api}`;
      $.logLight(`✓ ${api} enabled`);
    }
  }
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
  database.connection = selectedInstance.connectionName;
  database.address = selectedInstance.ipAddresses[0].ipAddress;
  return selectedInstance;
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

  $.log('Creating a Cloud SQL instance');
  $.logGroup();

  const sqlApis = ['sql-component.googleapis.com', 'sqladmin.googleapis.com'];
  for (const api of sqlApis) {
    if (enabledApis.includes(api)) {
      $.logLight(`✓ ${api} is enabled`);
    } else {
      await $`gcloud services enable ${api}`.quiet();
      $.logLight(`✓ ${api} enabled`);
    }
  }

  $.logLight(`Creating the instance. This takes a few minutes.`);
  const instance =
    await $`gcloud sql instances create ${database.instance} --database-version=${options.dbEngine} --cpu=${options.dbCpu} --memory=${options.dbMemory} --zone=${options.zone} --root-password=${rootPassword} --format=json`.json();
  database.connection = instance.connectionName;
  database.address = instance.ipAddresses[0].ipAddress;
  $.logLight(`✓ instance created and running at ${database.address}`);
  $.logGroupEnd();
};

const selectDabase = async () => {
  const databases =
    await $`gcloud sql databases list --instance=${database.instance} --format=json`.json();
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
};

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

const loadEnvVars = async () => {
  try {
    const lines = await $`cat .env`.lines();
    return lines;
  } catch (error) {
    return [];
  }
};

const getEnvironment = async () => {
  $.log('Collecting the environment variables');

  const prodDefaults = prodEnvironment.map((line) => {
    const [key, start] = line.split('=');
    return { key, value: start };
  });

  const ignoreList = prodDefaults.filter((item) => !item.value).map((item) => item.key);

  const pairs = await loadEnvVars();
  for (const pair of pairs) {
    const [key, start] = pair.split('=');
    if (!key || key[0] === '#') continue;
    if (ignoreList.includes(key)) continue;

    const value = await $.prompt({
      message: key,
      default: getDefault(key, start, prodDefaults),
      noClear: true,
    });
    const isSecret = await $.confirm({
      message: 'Is this a secret?',
      default: looksSecretive(key),
    });
    if (isSecret) {
      secrets.push({ key, value });
    } else {
      envVars.push({ key, value });
    }
  }
};

const looksSecretive = (key) => {
  const secretive = [
    'PASSWORD',
    'SECRET',
    'KEY',
    'TOKEN',
    'SALT',
    'HASH',
    'PRIVATE',
    'CERT',
    'PEM',
    'AUTH',
    'PASS',
    'PIN',
    'CODE',
  ];
  return secretive.some((item) => key.toUpperCase().includes(item));
};

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
};

const createSecrets = async () => {
  $.log('Creating secrets');
  $.logGroup();

  $.logLight(`fetching secrets`);
  const all = await $`gcloud secrets list --format=json`.json();

  for (const secret of secrets) {
    if (
      all.find((item) => item.name === `projects/${project.number}/secrets/${secret.key}`)
    ) {
      $.logLight(`✓ ${secret.key} already exists`);
      continue;
    }
    $.logLight(`creating ${secret.key} ...`);
    await $`echo ${secret.value} | gcloud secrets create ${secret.key} --data-file=-`;
    $.logLight(`✓ ${secret.key} created`);
  }

  $.logGroupEnd();
};

const createNewSecret = async () => {
  $.log('\nFetching existing secrets');
  $.logGroup();
  const all = await $`gcloud secrets list --format=json`.json();
  all.forEach((item) => {
    const parts = item.name.split('secrets/');
    $.logLight(parts[1]);
  });
  $.logGroupEnd();

  $.log('\nCreate new secrets. Enter an empty key to stop.\n');

  let key = '';
  let value = '';

  do {
    key = await $.prompt({
      message: 'key',
      noClear: true,
    });

    if (!key) break;

    value = await $.prompt({
      message: 'value',
      noClear: true,
    });

    if (!value) break;

    $.log(`creating ${key} ...`);
    await $`echo ${value} | gcloud secrets create ${key} --data-file=-`;
    $.logStep(`✓ ${key} created\n`);
  } while (true);
};

const setCloudRun = async () => {
  const result = await $.confirm('Do you want to create a Cloud Run service?');
  if (!result) return;

  const service = await $.prompt({
    message: 'Cloud Run service name',
    default: 'production',
    noClear: true,
  });

  const env = envVars.map((item) => `--set-env-vars "${item.key}=${item.value}" \\`);
  const sec = secrets.map((item) => `--set-secrets ${item.key}=${item.key}:1 \\`);

  const lines = [
    `gcloud run deploy ${service} \\`,
    `--source . \\`,
    `--project=${project.id} \\`,
    `--region=${options.region} \\`,
    `--set-cloudsql-instances=${database.instance} \\`,
    `--allow-unauthenticated \\`,
    ...env,
    ...sec,
  ];

  // the command is to long to run from the script
  // so we dump it in the report for the user to run it manually
  cloudRun = lines.join('\n');
};

const report = () => {
  $.log('');
  $.logWarn('Project');
  $.logGroup();
  $.log(`name: ${project.name}`);
  $.log(`id: ${project.id}`);
  $.log(`number: ${project.number}`);
  $.log(`account: ${project.account}`);
  $.log(`region: ${options.region}`);
  $.log(`zone: ${options.zone}`);
  $.logGroupEnd();

  if (database.instance) {
    $.logWarn('Database');
    $.logGroup();
    $.log(`instance: ${database.instance}`);
    $.log(`connection: ${database.connection}`);
    $.log(`name: ${database.name}`);
    $.log(`address: ${database.address}`);
    $.log(`user: ${database.user}`);
    $.logGroupEnd();
  }

  if (cloudRun) {
    $.logWarn('Cloud Run create command:');
    $.log(cloudRun);
  }

  // if (envVars.length > 0) {
  //   $.logWarn('Environment');
  //   $.logGroup();
  //   for (const item of envVars) {
  //     $.log(`${item.key}: ${item.value}`);
  //   }
  //   for (const item of secrets) {
  //     $.log(`${item.key}: [secret]`);
  //   }
  //   $.logGroupEnd();
  // }
};

class Build {
  static buildConnection = {
    name: 'github',
    platform: 'github',
  };

  constructor(project) {
    this.project = project;
    this.connection = null;
    this.repository = null;
  }

  async setConnection() {
    // assuming one connection per project
    const connections =
      await $`gcloud builds connections list --region=${options.region} --format=json`.json();
    if (connections.length > 0) {
      this.connection = connections[0];
      return;
    }

    $.log('Creating a connection to github');
    $.logGroup();
    // grant Cloud Build P4SA access to store the connection token

    // can't be .quiet() because it prompts for input:
    // [1] EXPRESSION = request.time < timestamp("2023-09-27T14:48:51.537Z"), TITLE = cloudbuild - connection - setup
    // [2] None
    // [3] Specify a new condition
    // The policy contains bindings with conditions, so specifying a condition is required when adding a binding.Please specify a condition.:
    // await $`gcloud projects add-iam-policy-binding ${this.project.id} --member serviceAccount:service-${this.project.number}@gcp-sa-cloudbuild.iam.gserviceaccount.com --role=roles/secretmanager.admin`.quiet();
    await $`gcloud projects add-iam-policy-binding ${this.project.id} --member serviceAccount:service-${this.project.number}@gcp-sa-cloudbuild.iam.gserviceaccount.com --role=roles/secretmanager.admin`;
    $.logLight(`✓ access granted to store the connection token`);
    // await $`gcloud projects add-iam-policy-binding ${this.project.id} --member serviceAccount:${this.project.number}@cloudbuild.gserviceaccount.com --role=roles/cloudsql.client --role=roles/secretmanager.secretAccessor`.quiet();
    await $`gcloud projects add-iam-policy-binding ${this.project.id} --member serviceAccount:${this.project.number}@cloudbuild.gserviceaccount.com --role=roles/cloudsql.client --role=roles/secretmanager.secretAccessor`;
    $.logLight(`✓ access granted to read secrets and migrate the database`);
    $.logGroupEnd();
    this.connection =
      await $`gcloud builds connections create ${Build.buildConnection.platform} ${Build.buildConnection.name} --project=${this.project.id} --region=${options.region}`;
  }

  async setRepo() {
    const repos =
      await $`gcloud builds repositories list --connection=${this.connection.name} --format=json`.json();
    if (repos.length === 0) {
      await this.createRepo();
      return;
    }

    const newRepo = 'Create a new repository';
    const option = await $.select({
      message: 'Select a repository or create a new one',
      options: [...repos.map((repo) => repo.name), newRepo],
    });

    if (option === repos.length) {
      await this.createRepo();
    } else {
      this.repository = repos[option];
    }
  }

  async createRepo() {
    const url = await $.prompt({
      message: 'Repository URL',
      noClear: true,
    });

    const name = await $.prompt({
      message: 'Repository name',
      default: url.split('/').pop(),
      noClear: true,
    });

    $.log('\nCreating a repository');
    $.logGroup();
    $.logLight(`using the connection to create a repository`);
    this.repository =
      await $`gcloud builds repositories create ${name} --remote-uri=${url} --connection=${this.connection.name} --region=${options.region} --format=json`.json();
    console.log(this.repository);
    $.logLight(`✓ repository created`);
    $.logGroupEnd();
  }

  async pickService() {
    const services =
      await $`gcloud run services list --platform=managed --format=json`.json();

    const name = await $.select({
      message: 'What service should be deployed?',
      options: services.map((service) => service.metadata.name),
    });

    return name;
  }

  async createTrigger() {
    await this.setConnection();
    await this.setRepo();

    $.log('\nFetching existing triggers');
    const triggers = await $`gcloud builds triggers list --format=json`.json();
    $.logGroup();
    triggers.forEach((trigger) => {
      $.logLight(trigger.name);
    });
    $.logGroupEnd();

    this.triggerType = await $.select({
      message: `What type of build trigger is needed?`,
      options: ['CD - deploy to Cloud Run', 'CI - run tests on new pull requests'],
    });

    const defaults = {
      name: '',
      description: '',
      branch: '',
    };

    switch (this.triggerType) {
      case 0:
        const service = await this.pickService();
        // May only contain alphanumeric characters and dashes
        defaults.name = `cd-${service}`;
        defaults.description = `Build and deploy to Cloud Run service ${service} on push to "^main$"`;
        defaults.branch = '^main$';
        break;

      case 1:
        defaults.name = `ci`;
        defaults.description = `Continuous integration script to run tests on any pull request`;
        defaults.branch = '^develop$';
        break;

      default:
        return;
    }

    // https://cloud.google.com/sdk/gcloud/reference/builds/triggers/create/github

    const name = await $.prompt({
      message: 'Trigger name',
      default: defaults.name,
      noClear: true,
    });

    const description = await $.prompt({
      message: 'Description',
      default: defaults.description,
      noClear: true,
    });

    $.log('Creating a Cloud Build trigger');
    $.logGroup();
    $.logLight(`using the connection to create a trigger`);
    $.logGroupEnd();
  }
}

await run();

/* Rest requests generated by gcp for the load balancer.

POST https://compute.googleapis.com/compute/v1/projects/ntj-journey/global/securityPolicies
{
  "description": "Default security policy for: startjourneys-io-backend",
  "name": "security-policy-backend-service-startjourneys-io-backend",
  "rules": [
    {
      "action": "allow",
      "match": {
        "config": {
          "srcIpRanges": [
            "*"
          ]
        },
        "versionedExpr": "SRC_IPS_V1"
      },
      "priority": 2147483647
    },
    {
      "action": "throttle",
      "description": "Default rate limiting rule",
      "match": {
        "config": {
          "srcIpRanges": [
            "*"
          ]
        },
        "versionedExpr": "SRC_IPS_V1"
      },
      "priority": 2147483646,
      "rateLimitOptions": {
        "conformAction": "allow",
        "enforceOnKey": "IP",
        "exceedAction": "deny(403)",
        "rateLimitThreshold": {
          "count": 500,
          "intervalSec": 60
        }
      }
    }
  ]
}

POST https://compute.googleapis.com/compute/beta/projects/ntj-journey/regions/europe-west2/networkEndpointGroups
{
  "cloudRun": {
    "service": "production"
  },
  "name": "startjourneys-io-endpointgroup",
  "networkEndpointType": "SERVERLESS",
  "region": "projects/ntj-journey/regions/europe-west2"
}

POST https://compute.googleapis.com/compute/beta/projects/ntj-journey/global/backendServices
{
  "backends": [
    {
      "balancingMode": "UTILIZATION",
      "group": "projects/ntj-journey/regions/europe-west2/networkEndpointGroups/startjourneys-io-endpointgroup"
    }
  ],
  "cdnPolicy": {
    "cacheKeyPolicy": {
      "includeHost": true,
      "includeProtocol": true,
      "includeQueryString": true
    },
    "cacheMode": "CACHE_ALL_STATIC",
    "clientTtl": 3600,
    "defaultTtl": 3600,
    "maxTtl": 86400,
    "negativeCaching": false,
    "serveWhileStale": 0
  },
  "compressionMode": "DISABLED",
  "connectionDraining": {
    "drainingTimeoutSec": 0
  },
  "description": "backend service for startjourneys-io custom domain",
  "enableCDN": true,
  "loadBalancingScheme": "EXTERNAL_MANAGED",
  "localityLbPolicy": "ROUND_ROBIN",
  "logConfig": {
    "enable": false
  },
  "name": "startjourneys-io-backend",
  "protocol": "HTTPS",
  "securityPolicy": "projects/ntj-journey/global/securityPolicies/security-policy-backend-service-startjourneys-io-backend",
  "sessionAffinity": "NONE",
  "timeoutSec": 30
}

POST https://compute.googleapis.com/compute/v1/projects/ntj-journey/global/backendServices/startjourneys-io-backend/setSecurityPolicy
{
  "securityPolicy": "projects/ntj-journey/global/securityPolicies/security-policy-backend-service-startjourneys-io-backend"
}

POST https://compute.googleapis.com/compute/v1/projects/ntj-journey/global/urlMaps
{
  "defaultService": "projects/ntj-journey/global/backendServices/startjourneys-io-backend",
  "name": "serverless-lb"
}

POST https://compute.googleapis.com/compute/v1/projects/ntj-journey/global/targetHttpsProxies
{
  "name": "serverless-lb-target-proxy",
  "quicOverride": "NONE",
  "sslCertificates": [
    "projects/ntj-journey/global/sslCertificates/startjourneys-io"
  ],
  "tlsEarlyData": "DISABLED",
  "urlMap": "projects/ntj-journey/global/urlMaps/serverless-lb"
}

POST https://compute.googleapis.com/compute/beta/projects/ntj-journey/global/forwardingRules
{
  "IPAddress": "projects/ntj-journey/global/addresses/startjourneys-io",
  "IPProtocol": "TCP",
  "description": "loadbalancer for startjourneys-io custom domain",
  "loadBalancingScheme": "EXTERNAL_MANAGED",
  "name": "startjourneys-io",
  "networkTier": "PREMIUM",
  "portRange": "443",
  "target": "projects/ntj-journey/global/targetHttpsProxies/serverless-lb-target-proxy"
}
*/
