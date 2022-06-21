const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

(() => {
    const time = (new Date()).getTime()
    const account_id = core.getInput('account-id');
    const api_key = core.getInput('api-key')
    const application_name = core.getInput('application-name')
    const context = github.context.payload;

    const search = {
        method: 'get',
        url: `https://api.newrelic.com/v2/applications.json?filter[name]=${application_name}`,
        headers: { 
          'X-Api-Key': api_key
        }
      };

      axios(search)
      .then(response => {
       
        if ( response.data.applications.length > 1 ){
            core.setFailed(`The application search returned more than one result, please be more specific or type the full application name.`);
            process.exit(1);
        }

        const application_id = response.data.applications[0].id 
        console.log("Application ID:", application_id)
        console.log("Commited At", context.head_commit.timestamp)
        core.setOutput("time", time);

      })
      .catch(error => {
        core.setFailed(error.message);
        process.exit(1);
      });

    
})();
