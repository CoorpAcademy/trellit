var express = require('express');
var config = require('./app/server/config/config.js');
var app = express();
var PORT = process.env.PORT || config.port; // for Heroku
var github = require('./app/server/libs/github');

app.get('/', function (req, res) {
  res.send('Welcome on Trellit!');
});


var server = app.listen(PORT, function () {
  console.log('Server listening...');
});

github.authenticate();