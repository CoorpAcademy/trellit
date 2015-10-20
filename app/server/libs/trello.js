var Trello = require('node-trello');
var config = require('../config/config').trello;
var APP_URL = require('../config/config').url;
var request = require('request');
var github = require('./github');
var Promise = require('bluebird');
var _ = require('lodash');
var trello;


module.exports = {
	init: init,
	createWebhook: createWebhook,
	addMember: addMember,
	moveCardToList: moveCardToList,
	addAttachment: addAttachment,
	getWebhooks: getWebhooks
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
		idModel: config.board.boardId
	} }, function(err, res, body) {
		if (err) { console.log('ERROR', err); }
		else { console.log(body); }
	});
}
function getWebhooks() {
	//request.del('https://api.trello.com/1/tokens/' + config.accessToken + '/webhooks/561ccb1d4e45dc9b7f81ca47?key=' + config.publicKey, 
	request.get('https://api.trello.com/1/tokens/' + config.accessToken + '/webhooks/?key=' + config.publicKey, 
	function(err, res, body) {
		if (err) { console.log('ERROR', err); }
		else { console.log(body); }
	});
}
function addMember(cardId, member) {
	console.log(member.trello.id);
	return trello.postAsync('/1/cards/' + cardId + '/idMembers', { value: member.trello.id })
	.catch(function(err) {
		console.log(err);
		if (err.responseBody === 'member is already on the card') {
			return Promise.resolve(err);
		}
		throw err;
	});
}
function moveCardToList(cardId, listName) {
	return trello.putAsync('/1/cards/' + cardId + '/idList', { value: config.board.lists[listName] });
}
function addAttachment(card, issue) {
	return trello.postAsync('/1/cards/' + card.id + '/attachments', {
		url: issue.html_url,
		name: '#' + issue.number
	});
}