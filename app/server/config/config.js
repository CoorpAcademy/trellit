var url = 'https://trellit.coorpacademy.com';

var boards = require('./boards.production.json');
var repos = require('./repos.production.json');

if (process.env.NODE_ENV === 'development') {
	var auth = require('../../../.auth.json');
	process.env.GITHUB_ACCESS_TOKEN = auth.GITHUB_ACCESS_TOKEN;
	process.env.TRELLO_PUBLIC = auth.TRELLO_PUBLIC;
	process.env.TRELLO_TOKEN = auth.TRELLO_TOKEN;

	url = 'http://937aba9e.ngrok.io';
	boards = require('./boards.development.json');
	repos = require('./repos.development.json');
}

module.exports = {
	port: process.env.PORT || 3000,
	url: url,
	github: {
		accessToken: process.env.GITHUB_ACCESS_TOKEN || '',
		callbackUrl: '/webhooks/github',
		repositories: repos
	},
	trello: {
		publicKey: process.env.TRELLO_PUBLIC || '',
		accessToken: process.env.TRELLO_TOKEN || '',
		boards: boards.boards,
		lists: boards.lists,
		callbackUrl: '/webhooks/trello'
	}
}