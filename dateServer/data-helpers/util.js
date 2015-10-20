var fs = require('fs');
var _ = require('underscore');
var Promise = require('bluebird');
var events = require('./events');

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
        var eventJSON = {
          fsCategory: fsCategory,
          eventname: event + ' at ' + venueCategory,
          venueCategory: venueCategory,
          event: event,
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

exports.seedEventTagRelationships = function(filename){
  createRelationshipJSON(filename)
  .then(function(json) {
    events.seedEventTagRelationships(json, function(err, relationships) {
      if (err) {
        console.log("There was an error creating relationships between tags and events", err);
      } else {
        console.log("Success! Events and tags are connected", relationships);
      }
    });
  });
}