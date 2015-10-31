var tags = require('./tags');
var events = require('./events');
var util = require('./util');
var Promise = require('bluebird');

/**************** Execute all data-helper functions *************** 
* Purpose: Seeding all tags, events, and event-tag relationships 
*          asynchronously into neo4j ON HEROKU. 
* > neo4j start 
* Open the db.js file and UPDATE the url string to 
* `http://app42960229:ILOdJGW9N5SoJPBc5qqu@app42960229.sb02.stations.graphenedb.com:24789`
* Only then can you run: 
* > node seedAllRemote.js 
*******************************************************************/

events.seedEventsAsync("remote")
.then(function() {
  return tags.seedTagsAsync("remote")
})
.then(function() {
  util.seedEventTagRelationships('./events.csv', "remote")
});
