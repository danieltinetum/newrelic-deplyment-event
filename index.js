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

        //console.log( JSON.stringify(payload.head_commit, null, 2) );

        const deployed_at = new Date().getTime();
        const commited_at = new Date(payload.head_commit.timestamp).getTime();

        console.log(deployed_at)
        console.log(commited_at)

        
        core.setOutput("time", 10000 );

    })();
} catch (error) {
    core.setFailed(error.message);
    process.exit(1);
}