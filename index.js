const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

try {
    (() => {
        const account_id = core.getInput('account-id');
        const api_key = core.getInput('api-key')
        const application_name = core.getInput('application-name')
        const context = github.context;
        //const payload = context.payload;

        
        const { payload, ...resto } = github.context

        console.log( resto );

        const deployed_at = new Date().getTime();
        const commited_at = new Date(payload.head_commit.timestamp).getTime();
        const elapsed_time = (deployed_at - commited_at) / 1000

        core.setOutput("time", Math.round(elapsed_time) );

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
                "environment": "PRD",
                "type": "regular",
                "jobName": context.job,
                "buildNumber": context.runNumber,
                "branchName": "MAASTER",
                "commit": payload.id,
                "codeCommittedTime": commited_at,
                "codeDeployedTime": deployed_at,
                "buildStatus": "SUCESSFULL"
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