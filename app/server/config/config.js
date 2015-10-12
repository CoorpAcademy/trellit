var url = 'http://gitello.coorpacademy.com';
var board = {
	boardId: '561228dc16f33267799133c3',
	lists: {
		inProgress: '561244c5945acda7e5626f90'
	}
};

if (process.env.NODE_ENV === 'development') {
	var auth = require('../../../.auth.dev.json');
	process.env.GITHUB_ACCESS_TOKEN = auth.GITHUB_ACCESS_TOKEN;
	process.env.TRELLO_PUBLIC = auth.TRELLO_PUBLIC;
	process.env.TRELLO_TOKEN = auth.TRELLO_TOKEN;
	url = 'http://13258555.ngrok.io';
	board = {
		boardId: '55fa8a07f150fe773e901c4d',
		lists: {
			inProgress: '560a581ae66d38d7816086bc'
		}
	}
}

module.exports = {
	port: process.env.PORT || 3000,
	url: url,
	github: {
		accessToken: process.env.GITHUB_ACCESS_TOKEN || '',
		user: 'CoorpAcademy',
		repo: 'trellit',
		callbackUrl: '/webhooks/github'
	},
	trello: {
		publicKey: process.env.TRELLO_PUBLIC || '',
		accessToken: process.env.TRELLO_TOKEN || '',
		board: board,
		callbackUrl: '/webhooks/trello'
	}
}