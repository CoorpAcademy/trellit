var github = require('github');
var config = require('../config/config.js').github;
var GITHUB;

module.exports = {
	authenticate: authenticate,
	webhook: webhook
}


function authenticate() {
	// first we initialize the github object
	GITHUB = new github({
		version: '3.0.0',
		protocol: 'https'
	});
	GITHUB.authenticate({
		type: 'token',
		token: config.accessToken,
	});
	console.log('github.authenticate done');
}
function webhook(payload) {
	if (payload.issue && payload.repository) {
		console.log(payload.action, payload.issue.number, payload.repository.name);
	} else {
		console.error(payload);
	}
	return payload;
}