const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

try {
    (() => {
        const account_id = core.getInput('account-id');
        const api_key = core.getInput('api-key');
        const insights_insert_key = core.getInput('insights-insert-key');
        const application_name = core.getInput('application-name');
        const { payload, ...context } = github.context
        const branch_name = context.ref.substring(context.ref.lastIndexOf('/') + 1, context.ref.length);


        const deployed_at = new Date().getTime();
        const commited_at = new Date(payload.head_commit.timestamp).getTime();
        const elapsed_time = (deployed_at - commited_at) / 1000

        core.setOutput("time", Math.round(elapsed_time));

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
                    "revision": context.runId,
                    "environment": ['main', 'master'].includes(branch_name) ? "PRD" : "QA",
                    "type": "regular",
                    "jobName": context.job,
                    "buildNumber": context.runNumber,
                    "branchName": branch_name,
                    "commit": payload.id,
                    "codeCommittedTime": commited_at,
                    "codeDeployedTime": deployed_at,
                    "buildStatus": "SUCESSFULL"
                });

                const config = {
                    method: 'post',
                    url: `https://insights-collector.newrelic.com/v1/accounts/${account_id}/events`,
                    headers: {
                        'X-Insert-Key': insights_insert_key,
                        'Content-Type': 'application/json'
                    },
                    data: registry
                };

                axios(config)
                .then(function (response) {
                        console.log(response.data)
                })
                .catch(function (error) {
                    core.setFailed(error.message);
                    process.exit(1);
                });

            })
            .catch(error => {
                core.setFailed(error.message);
                process.exit(1);
            })
    })();
} catch (error) {
    core.setFailed(error.message);
    process.exit(1);
}