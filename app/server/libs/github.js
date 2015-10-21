var GITHUB = require('github');
var config = require('../config/config').github;
var APP_URL = require('../config/config').url;
var Promise = require('bluebird');
var request = require('request');
var URL = require('url');
var _ = require('lodash');
var github;


module.exports = {
	authenticate: authenticate,
	createWebhooks: createWebhooks,
	getCardId: getCardId,
	attachCard: attachCard,
	getAssociatedIssue: getAssociatedIssue,
	urlToIssue: urlToIssue,
	editIssue: editIssue
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
function createWebhooks() {
	_.each(config.repositories, function(repository) {
		github.repos.createHookAsync({
			user: repository.user,
			repo: repository.repo,
			name: 'web',
			config: {
				url: APP_URL + config.callbackUrl,
				content_type: 'json'
			},
			events: ['issues', 'pull_request'],
			active: true
		}).then(function(webhook) {
			console.log(webhook.url);
		}).catch(function(err) {
			console.log(err.message);
		});
	});
}
function getCardId(issue) {
	var cardShortId;
	console.log('github.getCardId', '| issue number', issue.number, '| issue repo', issue.repository.name);
	return github.issues.getCommentsAsync({
		user: issue.repository.owner.login,
		repo: issue.repository.name,
		number: issue.number,
		per_page: 100
	}).then(function(comments) {
		console.log('github.getCardId-getCommentsAsync', '| comments.length', comments.length);
		_.each(comments, function(comment) {
			comment = comment.body.replace('&#x2F;', '/');
			console.log('github.getCardId-comment', '| comment', comment);
			var trelloCardUrls = comment.match(/https:\/\/trello.com\/c\/[^\"]*/g);
			console.log('github.getCardId-trelloCardUrls', '| trelloCardUrls', trelloCardUrls);
			if (trelloCardUrls) {
				cardShortId = trelloCardUrls[0].replace('https://trello.com/c/', '').split('/')[0];
				console.log('github.getCardId-cardShortId', '| cardShortId', cardShortId);
				return cardShortId;
			}
		});
		return cardShortId;
	});
}
function attachCard(issue, card) {
	var cardUrl = card.url.replace('/', '&#x2F;');
	var commentBody = '<a href="' + cardUrl + '"><img src="https:&#x2F;&#x2F;github.trello.services&#x2F;images&#x2F;trello-icon.png" width="12" height="12"> ' + card.name + '</a>';
	return github.issues.createCommentAsync({
		user: issue.repository.owner.login,
		repo: issue.repository.name,
		number: issue.number,
		body: commentBody
	});
}
function getAssociatedIssue(pullRequest) {
	var numbers = pullRequest.body.match(/\#[0-9]*/g); var number;
	if (numbers) {
		number = numbers[0].replace('#', '');
	}
	return github.issues.getRepoIssueAsync({
		user: pullRequest.repository.owner.login,
		repo: pullRequest.repository.name,
		number: number
	});
}
function urlToIssue(url) {
	var issue = {
		repository: {
			owner: {}
		}
	};
	url = url.replace('https://github.com/', '').split('/');
	issue.repository.owner.login = url[0];
	issue.repository.name = url[1];
	issue.number = url[3];
	return issue;
}
function editIssue(issue, params) {
	return github.issues.editAsync({
		user: issue.repository.owner.login,
		repo: issue.repository.name,
		number: issue.number,
		state: params.state
	});
}