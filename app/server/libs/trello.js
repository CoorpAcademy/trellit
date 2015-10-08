var Trello = require('node-trello');
var config = require('../config/config.js').trello;
var APP_URL = require('../config/config.js').url;
var request = require('request');
var github = require('./github.js');
var Promise = require('bluebird');
var trello;


module.exports = {
	init: init,
	createWebhook: createWebhook,
	webhook: webhook
}


function init() {
	// first we initialize the trello object
	trello = new Trello(config.publicKey, config.accessToken);
	Promise.promisifyAll(trello);
	console.log('trello.init done');
}
function createWebhook() {
	request.post('https://api.trello.com/1/tokens/' + config.accessToken + '/webhooks/?key=' + config.publicKey, { form: {
		description: 'My first webhook',
		callbackURL: APP_URL + config.callbackUrl,
		idModel: config.boardId
	} }, function(err, res, body) {
		if (err) { console.log('ERROR', err); }
		else { console.log(body); }
	});
}
function webhook(payload) {
	var promise;
	if (payload.action) {
		if (payload.action.type === 'createCard') {
			promise = handleCreateCard(payload.action.data.card);
		}
	}
	return promise;
}
function handleCreateCard(card) {
	console.log('trello.handleCreateCard', card.idShort);
	var body = '[Trello card ' + card.idShort + '](https://trello.com/c/' + card.shortLink + ')';
	return github.createIssue({
		title: card.name,
		body: body
	}).then(function(issue) {
		console.log('github.createIssue', issue.number);
		return trello.postAsync('/1/cards/' + card.id + '/attachments', {
			url: issue.html_url,
			name: '#' + issue.number
		});
	}).then(function(attachment) {
		console.log('trello.postAttachment', attachment.url);
		return card;
	});
}