var fs = require('fs');
var _ = require('underscore');
var Promise = require('bluebird');
var events = require('./events');

/** HELPER FUNCTON
* Purpose: Creating JSON object for events.js seedEventTagRelationships function
* JSON Object will be formatted as below:
*   { allEvents: 
*     [
*       { eventname: event + ' at ' + venueCategory, tags: ['tag1', 'tag2', ...], fsCategory: fsCategory, venueCategory: venueCategory, event: event, preposition: preposition },
*       { eventname: event + ' at ' + venueCategory, tags: ['tag1', 'tag2', ...], fsCategory: fsCategory, venueCategory: venueCategory, event: event, preposition: preposition },
*       { eventname: event + ' at ' + venueCategory, tags: ['tag1', 'tag2', ...], fsCategory: fsCategory, venueCategory: venueCategory, event: event, preposition: preposition },
*       ...
*     ]
*   }
*/
var createRelationshipJSON = function(filename) {
  var jsonPromise = new Promise(function(resolve, reject) {
    // Create json object to be processed by our cypher query
    fs.readFile(filename, 'utf8', function(err, data){
      if(err) {
        reject(err);
      } 

      var json = {
        allEvents: []
      }

      var lines = data.split('\n');
      lines.shift(); //delete headers

      //Process each line, creating object at array index {eventname:'', tags=[tag1, tag2], ...}
      _.each(lines, function(line){
        var lineData = line.split(',');
        var fsCategory = lineData.shift();
        var venueCategory = lineData.shift();
        var event = lineData.shift();
        var preposition = lineData.shift();
        var eventJSON = {
          fsCategory: fsCategory,
          eventname: event + ' at ' + venueCategory,
          venueCategory: venueCategory,
          event: event,
          preposition: preposition,
          tags: _.filter(lineData, function(tag){
            return tag !== ''
          })
        }
        json['allEvents'].push(eventJSON); 
      });
      resolve(json);
    });

  });

  return jsonPromise;  
}

/** HELPER FUNCTON
* Purpose: Seeding all relationship edges between Event nodes and Tag nodes in neo4j
*          Async function for first creating the relationship json object then seeding Event-Tag relationships
*/
exports.seedEventTagRelationships = function(filename){
  createRelationshipJSON(filename)
  .then(function(json) {
    events.seedEventTagRelationshipsAsync(json, function(err, relationships) {
      if (err) {
        console.log("There was an error creating relationships between tags and events", err);
      } else {
        console.log("Success! Events and tags are connected");
      }
    });
  });
}