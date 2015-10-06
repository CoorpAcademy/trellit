var express = require('express');
var config = require('./app/server/config.json');
var app = express();
var PORT = process.env.PORT || config.port; // for Heroku

app.get('/', function (req, res) {
  res.send('Welcome on Trellit!');
});

var server = app.listen(PORT, function () {
  console.log('Server listening...');
});