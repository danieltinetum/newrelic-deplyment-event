const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

try {
    (() => {
        const account_id = core.getInput('account-id');
        const api_key = core.getInput('api-key')
        const application_name = core.getInput('application-name')
        const context = github.context;
        const payload = context.payload;

        const commited_at = new Date(payload.head_commit.timestamp).getTime();
        const deploy_time = new Date().getTime();
        const time = deploy_time - commited_at

        core.setOutput("time", Math.round( time / 1000 ) );

        const search = {
            method: 'get',
            url: `https://api.newrelic.com/v2/applications.json?filter[name]=${application_name}`,
            headers: {
                'X-Api-Key': api_key
            }
        };

        axios(search)
            .then(response => {

                if (response.data.applications.length > 1) {
                    core.setFailed(`The application search returned more than one result, please be more specific or type the full application name.`);
                    process.exit(1);
                }
                

                const application_id = response.data.applications[0].id
                const nr_app_name = response.data.applications[0].name
                const registry = JSON.stringify({
                    "eventType": "BelDeployment",
                    "appId": application_id,
                    "appName": nr_app_name,
                    "revision": "0000010",
                    "environment": "DEV",
                    "type": "regular",
                    "jobName": context.job,
                    "buildNumber": context.runNumber,
                    "branchName": "qa",
                    "commit": payload.id,
                    "codeCommittedTime": commited_at,
                    "codeDeployedTime": deploy_time,
                    "buildStatus": "SUCESSFULL"
                  });

                console.log("Application ID:", application_id)
                console.log("Commited At:", context.head_commit.timestamp)
                console.log(`Elapsed Time: ${Math.round( time / 1000 )}`)

                console.log(JSON.stringify(registry, null, 2))

            })
            .catch(error => {
                core.setFailed(error.message);
                process.exit(1);
            });


    })();
} catch (error) {
    core.setFailed(error.message);
    process.exit(1);
}