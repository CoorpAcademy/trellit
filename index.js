var express = require('express');
var bodyParser = require('body-parser');
var config = require('./app/server/config/config.js');
var request = require('request');

var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var PORT = process.env.PORT || config.port; // for Heroku
var webhooks = require('./app/server/libs/webhookServices');


app.get('/', function (req, res) {
	console.log('GET /');
	res.send('Welcome on Trellit!');
});

app.post('/webhooks/github', function(req, res) {
	console.log('POST /webhooks/github');
	webhooks.webhook('github', req.body);
	res.send('Webhooks OK');
});

app.get(config.trello.callbackUrl, function(req, res) {
	console.log('GET /webhooks/trello');
	res.send('Webhook Trello OK');
});

app.post(config.trello.callbackUrl, function(req, res) {
	console.log('POST /webhooks/trello');
	webhooks.webhook('trello', req.body);
	res.send('Webhooks OK');
});

var server = app.listen(PORT, function () {
  console.log('Server listening...');
});

webhooks.init();
//webhooks.delWebhooks();
//webhooks.getWebhooks();
webhooks.createWebhooks();