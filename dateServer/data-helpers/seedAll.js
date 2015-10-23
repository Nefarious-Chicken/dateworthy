var tags = require('./tags');
var events = require('./events');
var util = require('./util');
var Promise = require('bluebird');

/**************** Execute all data-helper functions *************** 
* Purpose: Seeding all tags, events, and event-tag relationships 
*          asynchronously into neo4j
* > neo4j start 
* > node seedAll.js 
*******************************************************************/

events.seedEventsAsync()
.then(function() {
  return tags.seedTagsAsync()
})
.then(function() {
  util.seedEventTagRelationships('./events.csv')
});

