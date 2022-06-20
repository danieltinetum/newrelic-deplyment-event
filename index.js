const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios')

const time = (new Date()).toTimeString();
const account_id = core.getInput('account-id')


console.log("Your acount id:", account_id)
core.setOutput("time", time);

