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

        console.log( JSON.stringify(payload.head_commit, null, 2) )

        const commited_at = payload.head_commit.timestamp

        console.log('1.-',commited_at )
        console.log('2.-', new Date(commited_at).getTime())
        
        core.setOutput("time", 10000 );

    })();
} catch (error) {
    core.setFailed(error.message);
    process.exit(1);
}