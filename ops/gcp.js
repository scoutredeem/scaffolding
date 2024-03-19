#!/usr/bin/env -S deno run

import $ from 'https://deno.land/x/dax/mod.ts';
import chalk from 'https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js';


const project = {
    id: '',
    name: '',
    number: '',
    account: '',
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
        console.log(project);
    } catch (error) {
        console.log(chalk.red(error.message));
        return;
    }


    console.log(chalk.green('Done!'));
};

const createProject = async () => {
    // https://cloud.google.com/sdk/gcloud/reference/projects/create
    console.log(chalk.yellow('Creating a new project'));
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
    const fresh = await $`gcloud projects create ${project.id} --name="${project.name}" --set-as-default --format=json`.json();
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
}

const selectProject = async () => {
    const projects = await $`gcloud projects list --format=json`.json();
    if (projects.length === 0) return;

    const newProject = 'Create a new project';
    const option = await $.select({
        message: 'Select an existing project or create a new one',
        options: [...projects.map(project => project.name), newProject],
    });

    if (option == projects.length) return;

    const selectedProject = projects[option];
    project.id = selectedProject.projectId;
    project.name = selectedProject.name;
    project.number = selectedProject.projectNumber;
}

const authenticate = async () => {
    console.log('Log in with your partner services account');
    try {
        await $`gcloud auth login`;
    } catch (error) {
        throw new Error('Failed to authenticate with gcloud.');
    }
}

const setAccount = async () => {
    const accounts = await $`gcloud auth list --format=json`.json();
    const active = accounts.find(account => account.status === 'ACTIVE');
    if (!active) {
        throw new Error('No active account found. Please log in with gcloud.');
    }

    project.account = active.account;

    const billing = await $`gcloud billing accounts list --format=json`.json();
    if (billing.length === 0) {
        throw new Error('No billing account found. Please set up billing for your account.');
    }
}

const preflight = async () => {
    try {
        await $`which gcloud`.text();
    } catch (error) {
        throw new Error('gcloud is not installed.');
    }
}

await run();


// [
//     {
//         "createTime": "2024-02-26T04:15:25.939Z",
//         "labels": {
//             "firebase": "enabled"
//         },
//         "lifecycleState": "ACTIVE",
//         "name": "OTB Story",
//         "projectId": "otb-story",
//         "projectNumber": "395981754007"
//     },
//     {
//         "createTime": "2024-02-09T14:08:04.432Z",
//         "labels": {
//             "firebase": "enabled"
//         },
//         "lifecycleState": "ACTIVE",
//         "name": "otb-test-92a40",
//         "projectId": "otb-test-92a40",
//         "projectNumber": "1011630564323"
//     },
//     {
//         "createTime": "2024-02-06T13:16:34.167Z",
//         "lifecycleState": "ACTIVE",
//         "name": "Content CMS",
//         "projectId": "otb-cms",
//         "projectNumber": "1077977073733"
//     }
// ]