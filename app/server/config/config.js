if (process.env.NODE_ENV === 'development') {
	process.env.GITHUB_ACCESS_TOKEN = require('../../../.auth.dev.json').GITHUB_ACCESS_TOKEN;
}

module.exports = {
	port: process.env.PORT || 3000,
	github: {
		accessToken: process.env.GITHUB_ACCESS_TOKEN || '',
		user: 'CoorpAcademy',
		repo: 'coorpacademy-cockpit'
	}
}