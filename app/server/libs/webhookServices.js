var github = require('./github');
var trello = require('./trello');
var members = require('./db').members;

module.exports = {
	init: init,
	webhook: webhook
}

function init() {
	github.authenticate();
	trello.init();
	trello.createWebhook();
}
function webhook(service, payload) {
	var promise;
	if (service === 'github' && payload.action && payload.action === 'assigned') {
		promise = handleAssigned(payload);
	}
	if (service === 'trello' && payload.action) {
		console.log(payload.action.type);
		if (payload.action.type === 'createCard') {
			promise = handleCreateCard(payload.action.data.card);
		}
	}
	return promise;
}
function handleAssigned(payload) {
	var cardId = github.getCardId(payload.issue);
	if (cardId) {
		var member = members.get('github.login', payload.assignee.login);
		if (member) {
			return trello.addMembers(cardId, [member])
			.then(function(card) {
				return trello.moveCardToList(cardId, 'inProgress');
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