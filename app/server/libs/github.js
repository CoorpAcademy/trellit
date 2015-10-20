var GITHUB = require('github');
var config = require('../config/config').github;
var Promise = require('bluebird');
var URL = require('url');
var _ = require('lodash');
var github;


module.exports = {
	authenticate: authenticate,
	createIssue: createIssue,
	getCardId: getCardId,
	attachCard: attachCard
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
	var cardShortId;
	return github.issues.getCommentsAsync({
		user: issue.repository.owner.login,
		repo: issue.repository.name,
		number: issue.number,
		per_page: 100
	}).then(function(comments) {
		_.each(comments, function(comment) {
			var trelloCardUrls = comment.body.replace('&#x2F;', '/').match(/https:\/\/trello.com\/c\/[^\"]*/g);
			if (trelloCardUrls) {
				cardShortId = trelloCardUrls[0].replace('https://trello.com/c/', '').split('/')[0];
				return cardShortId;
			}
		});
		return cardShortId;
	});
}
function attachCard(issue, card) {
	//console.log(card);
	var cardUrl = card.url.replace('/', '&#x2F;');
	var commentBody = '<a href="' + cardUrl + '"><img src="https:&#x2F;&#x2F;github.trello.services&#x2F;images&#x2F;trello-icon.png" width="12" height="12"> ' + card.name + '</a>';
	return github.issues.createCommentAsync({
		user: issue.repository.owner.login,
		repo: issue.repository.name,
		number: issue.number,
		body: commentBody
	});
}