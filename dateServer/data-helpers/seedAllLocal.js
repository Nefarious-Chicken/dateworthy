var tags = require('./tags');
var events = require('./events');
var util = require('./util');
var Promise = require('bluebird');

/**************** Execute all data-helper functions *************** 
* Purpose: Seeding all tags, events, and event-tag relationships 
*          asynchronously into neo4j on LOCAL database
* > neo4j start 
* > node seedAllLocal.js 
*******************************************************************/

events.seedEventsAsync("local")
.then(function() {
  return tags.seedTagsAsync("local")
})
.then(function() {
  util.seedEventTagRelationships('./events.csv', "local")
});
