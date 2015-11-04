
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
var sass = require('node-sass-middleware');
var parser = require('ua-parser-js');
var favicon = require('serve-favicon');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
console.log(__dirname + '/scss');
console.log(__dirname + '/public/css');

app.use(sass({
    /* Options */
    src: __dirname + '/scss',
    dest: __dirname + '/public/css',
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/public/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/> 
}));
app.use(favicon(__dirname + '/favicon.ico'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
// app.use(express.favicon());
app.use('/app', express.static(path.join(__dirname, '../dateClient/www/')));
app.get('/', function(req, res) {
  res.render('index', {title: 'dateworthy.io'});
});
app.get('/go', function(req, res) {
  var ua = parser(req.headers['user-agent']);
  console.log(ua.device.type);
  if (ua.device.type === 'mobile') {
    res.redirect('/app');
  } else {
    res.render('go', {title: 'dateworthy.io app'});
  }
});
app.get('/about', function(req, res) {
  res.render('about', {title: 'about dateworthy.io'});
});
app.get('/privacy', function(req, res) {
  res.render('privacy', {title: 'privacy policy'});
});

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

app.locals.title = 'Node-Neo4j Template';

app.listen(app.get('port'));
console.log('Listening to port ' + app.get('port'));

module.exports = app;
