var url = 'http://gitello.coorpacademy.com/';

if (process.env.NODE_ENV === 'development') {
	var auth = require('../../../.auth.dev.json');
	process.env.GITHUB_ACCESS_TOKEN = auth.GITHUB_ACCESS_TOKEN;
	process.env.TRELLO_PUBLIC = auth.TRELLO_PUBLIC;
	process.env.TRELLO_TOKEN = auth.TRELLO_TOKEN;
	url = 'http://13258555.ngrok.io'
}

module.exports = {
	port: process.env.PORT || 3000,
	url: url,
	github: {
		accessToken: process.env.GITHUB_ACCESS_TOKEN || '',
		user: 'CoorpAcademy',
		repo: 'coorpacademy-cockpit',
		callbackUrl: '/webhooks/github'
	},
	trello: {
		publicKey: process.env.TRELLO_PUBLIC || '',
		accessToken: process.env.TRELLO_TOKEN || '',
		boardId: '55fa8a07f150fe773e901c4d',
		callbackUrl: '/webhooks/trello'
	}
}