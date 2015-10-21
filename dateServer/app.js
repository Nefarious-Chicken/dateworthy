
/**
 * Module dependencies.
 */

var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
// app.use(express.favicon());
app.use(express.static(path.join(__dirname, '../dateClient/www/')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());

// routing handled in middleware
require('./config/middleware.js')(app, express);

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.locals.title = 'Node-Neo4j Template'

app.listen(app.get('port'));
console.log('Listening to port ' + app.get('port'));

module.exports = app;
