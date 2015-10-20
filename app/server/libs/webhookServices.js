var github = require('./github');
var trello = require('./trello');
var members = require('./db').members;

module.exports = {
	init: init,
	webhook: webhook,
	getWebhooks: getWebhooks
}

function init() {
	github.authenticate();
	trello.init();
	trello.createWebhook();
}
function webhook(service, payload) {
	var promise;
	if (service === 'github' && payload.action) {
		console.log(payload.action);
		if (payload.action === 'opened') {
			promise = handleNewIssue(payload);
		}
		if (payload.action === 'assigned') {
			promise = handleAssigned(payload);
		}
	}
	if (service === 'trello' && payload.action) {
		console.log(payload.action.type);
		if (payload.action.type === 'createCard') {
//			promise = handleCreateCard(payload.action.data.card);
		}
	}
	return promise;
}
function handleNewIssue(payload) {
	var issue = payload.issue; var card;
	if (issue) {
		issue.repository = payload.repository;
		var member = members.get('github.login', payload.issue.user.login);
		return trello.createCard(issue, member)
		.then(function(_card) {
			card = _card;
			return trello.addAttachment(card, issue);
		})
		.then(function() {
			return github.attachCard(issue, card);
		});
	}
}
function handleAssigned(payload) {
	var issue = payload.issue || payload.pull_request;
	var cardId = github.getCardId(issue);
	if (cardId) {
		var member = members.get('github.login', payload.assignee.login);
		console.log(member);
		if (member) {
			return trello.addMember(cardId, member)
			.then(function(card) {
				if (payload.issue) {
					return trello.moveCardToList(cardId, 'inProgress');
				}
				if (payload.pull_request) {
					return trello.moveCardToList(cardId, 'toReview');
				}
			});
		}
	} else {
		console.log('WARNING: no card found for issue', payload.issue.number);
	}
}
function handleCreateCard(card) {
	console.log('trello.handleCreateCard', card.idShort);
	var body = '[Trello card ' + card.idShort + '](https://trello.com/c/' + card.shortLink + ')';
	return github.createIssue({
		title: card.name,
		body: body
	}).then(function(issue) {
		console.log('github.createIssue', issue.number);
		return trello.addAttachment(card, issue);
	}).then(function(attachment) {
		console.log('trello.postAttachment', attachment.url);
		return card;
	});
}
function getWebhooks() {
	return trello.getWebhooks();
}