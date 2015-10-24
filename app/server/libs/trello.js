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
	getCard: getCard,
	createCard: createCard,
	addAttachment: addAttachment,
	getIssueUrl: getIssueUrl,
	addMember: addMember,
	deleteMember: deleteMember,
	moveCardToList: moveCardToList,
	createWebhook: createWebhook,
	getWebhooks: getWebhooks,
	delWebhooks: delWebhooks,
	addTokenMemberToBoards: addTokenMemberToBoards
}


function init() {
	// first we initialize the trello object
	trello = new Trello(config.publicKey, config.accessToken);
	Promise.promisifyAll(trello);
	console.log('trello.init done');
}
function getCard(id) {
	return trello.getAsync('/1/cards/' + id); 
}
function createCard(issue, member) {
	var idMembers = member ? member.trello.id : null;
	return trello.postAsync('/1/cards/', { 
		idList: config.lists.backlog,
		name: '#' + issue.number + ' - ' + issue.title,
		due: null,
		pos: 'bottom',
		idMembers: idMembers
	});
}
function addMember(cardId, member) {
	console.log(member.trello.id);
	return trello.postAsync('/1/cards/' + cardId + '/idMembers', { value: member.trello.id })
	.catch(function(err) {
		if (err.responseBody === 'member is already on the card') {
			console.log('member is already on the card');
			return Promise.resolve(err);
		}
		throw err;
	});
}
function deleteMember(cardId, member) {
	return trello.delAsync('/1/cards/' + cardId + '/idMembers/' + member.trello.id);
}
function addAttachment(card, issue) {
	var id = card.id || card.shortlink;
	return trello.postAsync('/1/cards/' + id + '/attachments', {
		url: issue.html_url,
		name: '#' + issue.number
	});
}
function getIssueUrl(card) { // TODO handle array of issues
	var id = card.id || card.shortlink; var issueUrl;
	return trello.getAsync('/1/cards/' + id + '/attachments')
	.then(function(attachments) {
		_.each(attachments, function(attachment) {
			if (attachment.url && attachment.url.indexOf('https://github.com/') >= 0 && attachment.url.indexOf('issues/') > 0) {
				issueUrl = attachment.url;
				return issueUrl;
			}
		});
		return issueUrl;
		console.log(attachments);
	});
}
function moveCardToList(cardId, listName) {
	console.log('moveCardToList', '| cardId', cardId, '| board id', config.boards.currentSprint, '| list id', config.lists[listName]);
	getCard(cardId).then(function(card) {
		if (card.idBoard === config.boards.currentSprint) {
			return trello.putAsync('/1/cards/' + cardId + '/idList', { value: config.lists[listName]});
		} else {
			return trello.putAsync('/1/cards/' + cardId + '/idBoard', { value: config.boards.currentSprint, idList: config.lists[listName] });
		}
	});
}
function createWebhook() {
	request.post('https://api.trello.com/1/tokens/' + config.accessToken + '/webhooks/?key=' + config.publicKey, { form: {
		description: 'Trellit',
		callbackURL: APP_URL + config.callbackUrl,
		idModel: config.boards.currentSprint
	} }, function(err, res, body) {
		if (err) { console.log('ERROR', err); }
		else { console.log(body); }
	});
}
function getWebhooks() {
	return trello.getAsync('/1/tokens/' + config.accessToken + '/webhooks/?key=' + config.publicKey)
	.then(function(webhooks) {
		return webhooks.filter(function(webhook) {
			return (webhook.callbackURL.indexOf(APP_URL) >= 0);
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
function delWebhook(hook) {
	return trello.delAsync('/1/webhooks/' + hook.id);
}
function addTokenMemberToBoards() {
	var idMember; var promises = [];
	return trello.getAsync('/1/tokens/' + config.accessToken)
	.then(function(token) {
		console.log('addToBoards', '=> token:', token);
		idMember = token.idMember;
		_.forEach(config.boards, function(idBoard, boardKey) {
			promises.push(addMemberToBoard(idBoard, idMember));
		});
		return Promise.all(promises);
	});
}
function addMemberToBoard(idBoard, idMember) {
	console.log(idBoard, idMember);
	return trello.putAsync('/1/boards/' + idBoard + '/members/' + idMember, { idMember: idMember, 'type': 'normal'})
}