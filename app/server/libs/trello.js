var Trello = require('node-trello');
var config = require('../config/config.js').trello;
var appUrl = require('../config/config.js').url;
var request = require('request');
var trello;



module.exports = {
	init: init,
	createWebhook: createWebhook,
	webhook: webhook
}


function init() {
	// first we initialize the trello object
	trello = new Trello(config.publicKey, config.accessToken);
}

function createWebhook() {
	request.post('https://api.trello.com/1/tokens/' + config.accessToken + '/webhooks/?key=' + config.publicKey, { form: {
		description: 'My first webhook',
		callbackURL: appUrl + config.callbackUrl,
		idModel: config.boardId
	} }, function(err, res, body) {
		if (err) { console.log('ERROR', err); }
		else { console.log(body); }
	});
}
function webhook(payload) {
	if (payload.action) {
		console.log(payload.action.type);
	}
	return payload;
}