var express = require('express');
var bodyParser = require('body-parser');
var config = require('./app/server/config/config.js');

var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var PORT = process.env.PORT || config.port; // for Heroku
var github = require('./app/server/libs/github');
var trello = require('./app/server/libs/trello');

app.get('/', function (req, res) {
	console.log('GET /');
	res.send('Welcome on Trellit!');
});

app.post('/webhooks/github', function(req, res) {
	console.log('POST /webhooks/github');
	github.webhook(req.body);
	res.send('Webhooks OK');
});

app.get(config.trello.callbackUrl, function(req, res) {
	console.log('GET /webhooks/trello');
	res.send('Webhook Trello OK');
});

app.post(config.trello.callbackUrl, function(req, res) {
	console.log('POST /webhooks/trello');
	trello.webhook(req.body);
	res.send('Webhooks OK');
});

var server = app.listen(PORT, function () {
  console.log('Server listening...');
});

github.authenticate();
trello.init();
trello.createWebhook();