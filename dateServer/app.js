
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
app.use(express.static(path.join(__dirname, 'public')));
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

// Routes

// app.get('/', routes.site.index);

// app.get('/users', routes.users.list);
// app.post('/users', routes.users.create);
// app.get('/users/:username', routes.users.show);
// app.post('/users/:username', routes.users.edit);
// app.del('/users/:username', routes.users.del);

// app.post('/users/:username/follow', routes.users.follow);
// app.post('/users/:username/unfollow', routes.users.unfollow);

// app.post('/users/:username/tag', routes.users.tag);
// app.post('/users/:username/untag', routes.users.untag);

// Handlers 
// app.post('/users/:username/preferences', routes.users.getAllTags);
// app.post('/bestmatch', routes.users.getMatchingEvents);

// Handlers for creating tags
// app.post('/tags', routes.tags.create);
// app.del('/tags/:tagname', routes.tags.del);

// Handlers for creating dates (events)
// app.post('/events', routes.events.create);
// app.post('/events/:eventname/tag', routes.events.tag);
// app.post('/events/:eventname/untag', routes.events.untag);
// app.del('/events/:eventname', routes.events.del);

// http.createServer(app).listen(app.get('port'), function(){
//   console.log('Express server listening at: http://localhost:%d/', app.get('port'));
// });

app.listen(app.get('port'));
console.log('Listening to port ' + app.get('port'));

module.exports = app;
