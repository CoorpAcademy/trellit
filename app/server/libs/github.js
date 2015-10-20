var GITHUB = require('github');
var config = require('../config/config').github;
var Promise = require('bluebird');
var URL = require('url');
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
function getCardId(issue) { // TODO
	var cardUrl = issue.body.match(/https:\/\/trello.com[^\)]*/g)[0]; var cardShortId;
	if (cardUrl) {
		cardShortId = URL.parse(cardUrl).pathname.split('/c/')[1];
	} else {
		// TODO retrieve comments
		//https://api.github.com/repos/CoorpAcademy/trellit/issues/24/comments
	}
	return cardShortId;
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