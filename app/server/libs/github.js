var GITHUB = require('github');
var config = require('../config/config').github;
var APP_URL = require('../config/config').url;
var Promise = require('bluebird');
var request = require('request');
var URL = require('url');
var _ = require('lodash');
var github;
var SKIP_TRELLIT_STRING = '[skip trellit]';


module.exports = {
	authenticate: authenticate,
	getWebhooks: getWebhooks,
	createWebhooks: createWebhooks,
	delWebhooks: delWebhooks,
	getCardId: getCardId,
	attachCard: attachCard,
	getAssociatedIssue: getAssociatedIssue,
	urlToIssue: urlToIssue,
	editIssue: editIssue,
	skipCreateCard: skipCreateCard
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
function getWebhooks() {
	var promises = [];
	_.each(config.repositories, function(repository) {
		promises.push(getWebhook(repository));
	});
	return Promise.all(promises)
	.then(function(webhooks) {
		return _.flatten(webhooks).filter(function(webhook) {
			return (webhook.config.url && webhook.config.url.indexOf(APP_URL) >= 0);
		});
	});
}
function getWebhook(repository) {
	return github.repos.getHooksAsync({
		user: repository.user,
		repo: repository.repo
	});
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
function delWebhooks(webhooks) {
	var promises = [];
	_.each(webhooks, function(webhook) {
		promises.push(delWebhook(webhook));
	})
	return Promise.all(promises);
}
function delWebhook(webhook) {
	var repository = urlToRepo(webhook.url);
	return github.repos.deleteHook({
		user: repository.user,
		repo: repository.repo,
		id: webhook.id
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
			if (cardShortId) {
				return;
			}
			comment = comment.body.replace(/&#x2F;/g, '/');
			var trelloCardUrls = comment.match(/https:\/\/trello.com\/c\/[^\"]*/g);
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
	var cardUrl = card.url.replace(/\//g, '&#x2F;');
	var commentBody = '<a href="' + cardUrl + '"><img src="https:&#x2F;&#x2F;github.trello.services&#x2F;images&#x2F;trello-icon.png" width="12" height="12"> ' + card.name + '</a>';
	return github.issues.createCommentAsync({
		user: issue.repository.owner.login,
		repo: issue.repository.name,
		number: issue.number,
		body: commentBody
	});
}
function getAssociatedIssue(pullRequest) {
	var bodyAndTitle = pullRequest.title + ' ' + pullRequest.body
	var numbers = bodyAndTitle.match(/\#[0-9]*/g); var number;
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
function urlToRepo(url) {
	var repository = {}
	url = url.replace('https://api.github.com/repos/', '').split('/');
	repository.user = url[0];
	repository.repo = url[1];
	return repository;
}
function editIssue(issue, params) {
	return github.issues.editAsync({
		user: issue.repository.owner.login,
		repo: issue.repository.name,
		number: issue.number,
		state: params.state
	});
}
function skipCreateCard(issue) {
	return (issue.body.indexOf(SKIP_TRELLIT_STRING) === 0);
}