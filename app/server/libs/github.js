var GITHUB = require('github');
var config = require('../config/config.js').github;
var Promise = require('bluebird');
var github;

module.exports = {
	authenticate: authenticate,
	webhook: webhook,
	createIssue: createIssue
}


function authenticate() {
	// first we initialize the github object
	github = new GITHUB({
		version: '3.0.0',
		protocol: 'https'
	});
	
	Promise.promisifyAll(github.events);
	Promise.promisifyAll(github.issues);
	Promise.promisifyAll(github.repos);
	
	github.authenticate({
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
function createIssue(issue) {
	return github.issues.createAsync({
		user: config.user,
		repo: config.repo,
		body: issue.body,
		title: issue.title
	});
}