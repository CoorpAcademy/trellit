var GITHUB = require('github');
var config = require('../config/config').github;
var Promise = require('bluebird');
var URL = require('url');
var github;


module.exports = {
	authenticate: authenticate,
	createIssue: createIssue,
	getCardId: getCardId
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
function createIssue(issue) {
	return github.issues.createAsync({
		user: config.user,
		repo: config.repo,
		body: issue.body,
		title: issue.title
	});
}
function getCardId(issue) {
	var cardUrl = issue.body.match(/https:\/\/trello.com[^\)]*/g)[0]; var cardShortId;
	if (cardUrl) {
		cardShortId = URL.parse(cardUrl).pathname.split('/c/')[1];
	} else {
		// TODO retrieve comments
		//https://api.github.com/repos/CoorpAcademy/trellit/issues/24/comments
	}
	return cardShortId;
}