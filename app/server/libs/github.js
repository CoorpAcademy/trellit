var Github = require('github');
var config = require('../config/config.js').github;

// first we initialize the github object
var github = new Github({
	version: '3.0.0',
	protocol: 'https'
});


module.exports = {
	authenticate: authenticate,
	getIssues: getIssues
}


function authenticate() {
	console.log(config.accessToken);
	github.authenticate({
		type: 'token',
		token: config.accessToken,
	});
	console.log('github.authenticate done');
}
function getIssues(params) {
	params = params || {};
	console.log('getIssues with params', params);
	return github.issues.repoIssues({
		user: config.user,
		repo: config.repo,
		state: params.state || 'all',
		per_page: params.perPage || 30
	}, function(err, issues) {
		if (err) { console.error(err); }
		else { console.log('#issues', issues.length); }
	});
}