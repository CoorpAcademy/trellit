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
		if (payload.action === 'opened' && payload.issue) {
			promise = handleNewIssue(payload);
		}
		if (payload.action === 'opened' && payload.pull_request) {
			promise = handleNewPullRequest(payload);
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
function handleNewPullRequest(payload) {
	var pullRequest = payload.pull_request; var card;
	pullRequest.repository = payload.repository;
	github.getAssociatedIssue(pullRequest)
	.then(function(issue) {
		if (!issue) { console.log('WARNING: no issue found for pullRequest', pullRequest.number); }
		console.log(issue.number);
		issue.repository = payload.repository;
		return github.getCardId(issue);
	}).then(function(shortLink) {
		if (!shortLink) { console.log('WARNING: no card found for pullRequest', pullRequest.number); }
		console.log(shortLink);
		return trello.getCard(shortLink);
	}).then(function(_card) {
		card = _card;
		return trello.addAttachment(card, pullRequest);
	}).then(function() {
		github.attachCard(pullRequest, card);
	}).catch(function(err) {
		console.log(err);
	});
}
function handleAssigned(payload) {
	var issue = payload.issue || payload.pull_request;
	issue.repository = payload.repository;
	return github.getCardId(issue)
	.then(function(cardId) {
		if (cardId) {
			var member = members.get('github.login', payload.assignee.login);
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
	});
}
function handleCreateCard(card) {
// 	console.log('trello.handleCreateCard', card.idShort);
// 	var body = '[Trello card ' + card.idShort + '](https://trello.com/c/' + card.shortLink + ')';
// 	return github.createIssue({
// 		title: card.name,
// 		body: body
// 	}).then(function(issue) {
// 		console.log('github.createIssue', issue.number);
// 		return trello.addAttachment(card, issue);
// 	}).then(function(attachment) {
// 		console.log('trello.postAttachment', attachment.url);
// 		return card;
// 	});
}
function getWebhooks() {
	return trello.getWebhooks();
}