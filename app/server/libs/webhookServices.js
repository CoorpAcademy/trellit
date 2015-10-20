var github = require('./github');
var trello = require('./trello');
var members = require('./db').members;
var config = require('../config/config');

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
		if (payload.action === 'closed' && payload.pull_request) {
			promise = handleClosedPullRequest(payload);
		}
		if (payload.action === 'assigned') {
			promise = handleAssigned(payload);
		}
		if (payload.action === 'unassigned') {
			promise = handleUnassigned(payload);
		}
	}
	if (service === 'trello' && payload.action) {
		console.log(payload.action.type);
		if (payload.action.type === 'createCard') {
//			promise = handleCreateCard(payload.action.data.card);
		}
		if (payload.action.type === 'updateCard' && payload.action.data.listAfter && payload.action.data.listAfter.id === config.trello.lists.done) {
			promise = handleDoneCard(payload.action.data.card);
		}
		if (payload.action.type === 'updateCard' && payload.action.data.listAfter && payload.action.data.listBefore.id === config.trello.lists.done) {
			promise = handleReopenedCard(payload.action.data.card);
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
function handleClosedPullRequest(payload) {
	var pullRequest = payload.pull_request; var card;
	if (pullRequest.merged) {
		pullRequest.repository = payload.repository;
		return github.getCardId(pullRequest)
		.then(function(shortLink) {
			if (shortLink) {
				return trello.moveCardToList(shortLink, 'toTest');
			}
		});
	}
}
function handleAssigned(payload) {
	var issue = payload.issue || payload.pull_request; var member; var cardId;
	issue.repository = payload.repository;
	return github.getCardId(issue)
	.then(function(_cardId) {
		cardId = _cardId;
		if (payload.issue) {
			return trello.moveCardToList(cardId, 'inProgress');
		}
		if (payload.pull_request) {
			return trello.moveCardToList(cardId, 'toReview');
		}
	}).then(function(card) {
		member = members.get('github.login', payload.assignee.login);
		if (member) {
			return trello.addMember(cardId, member)
		}
	}).catch(function(err) {
		console.log(err);
	});
}
function handleUnassigned(payload) {
	var issue = payload.issue || payload.pull_request; var member; var cardId;
	issue.repository = payload.repository;
	return github.getCardId(issue)
	.then(function(_cardId) {
		cardId = _cardId;
		if (payload.issue) {
			return trello.moveCardToList(cardId, 'todo');
		}
		if (payload.pull_request) {
			return trello.moveCardToList(cardId, 'inProgress');
		}
	}).then(function(card) {
		member = members.get('github.login', payload.assignee.login);
		if (member) {
			return trello.deleteMember(cardId, member);
		}
	}).catch(function(err) {
		console.log(err);
	});
}
function handleDoneCard(card) {
	return trello.getIssueUrl(card)
	.then(function(issueUrl) {
		return github.urlToIssue(issueUrl);
	}).then(function(issue) {
		github.editIssue(issue, {state: 'closed'});
	}).catch(function(err) {
		console.log(err);
	});
}
function handleReopenedCard(card) {
	return trello.getIssueUrl(card)
	.then(function(issueUrl) {
		return github.urlToIssue(issueUrl);
	}).then(function(issue) {
		github.editIssue(issue, {state: 'open'});
	}).catch(function(err) {
		console.log(err);
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