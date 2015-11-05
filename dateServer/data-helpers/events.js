var neo4j = require('neo4j');
var errors = require('../models/errors');
var Tag = require('../models/tag');
var Event = require('../models/event');
var db = require('../models/db');
var path = require('path');
var Promise = require('bluebird');

/** HELPER FUNCTON
* Purpose: Seeding all events and its associated properties from a csv into neo4j
*/
exports.seedEvents = function(env, callback) {
  var filename;
  if (env === "remote") {
    filename = "http://dateworthy.heroku.com/app/events.csv";
  } else if (env === "local") {
    filename = "file://" + __dirname + "/events.csv";
  }
  // Query for creating a constraint on a node's eventname so nodes with the same eventname can't be created
  var createConstraintQuery = 'CREATE CONSTRAINT ON (event:Event) ASSERT event.eventname IS UNIQUE';

  /** These are properties that will be attached to each Event node:
  *     eventname - semantic event string: concatenating an event (e.g. Throw a frisbee) at a venue (e.g. Park)
  *     fsCategory - associated Foursquare categoryID
  *     event - the action/activity (e.g. Throw a frisbee)
  *     venueCategory - the semantic Foursquare category tied to a categoryID (e.g. Park);
  */
  var props = [
    'eventname: csvLine.event + " " + csvLine.preposition + " " + csvLine.venueCategory,',
    'fsCategory: csvLine.fsCategory,',
    'event: csvLine.event,',
    'venueCategory: csvLine.venueCategory,',
    'preposition: csvLine.preposition'
  ].join(' ');

  // General query for reading each line from the csv and creating an Event node based on line contents
  // http://dateworthy.heroku.com/app/events.csv
  var loadLine = 'LOAD CSV WITH HEADERS FROM "' + filename + '" AS csvLine';
  var query = [
    loadLine,
    'CREATE (event:Event { ' + props + ' } )'
  ].join('\n');

  // Run the constraint creation query
  db.cypher({
    query: createConstraintQuery
  }, function(err, results) {
    if (err) {
      console.log("Couldn't create constraint on Events graph", err);
      callback(err, null);
    } else {
      // Run the query for creating Events
      db.cypher({
        query: query
      }, function(err, results) {
        if (err) {
          console.log("Error creating Event nodes in neo4j", err);
          callback(err, null);
        } else {
          if (results) {
            console.log("Successfully created Event nodes in neo4j");
            callback(null, results);
          }
        }
      }) 
    }
  })
};

/** HELPER FUNCTON
* Purpose: Seeding all relationship edges between Event nodes and Tag nodes in neo4j
* Input: JSON Object - this json object is always generated from util.js createRelationshipJSON function
* JSON Object will be formatted as below:
*   { allEvents: 
*     [
*       { eventname: event + ' at ' + venueCategory, tags: ['tag1', 'tag2', ...], fsCategory: fsCategory, venueCategory: venueCategory, event: event },
*       { eventname: event + ' at ' + venueCategory, tags: ['tag1', 'tag2', ...], fsCategory: fsCategory, venueCategory: venueCategory, event: event },
*       { eventname: event + ' at ' + venueCategory, tags: ['tag1', 'tag2', ...], fsCategory: fsCategory, venueCategory: venueCategory, event: event },
*       ...
*     ]
*   }
*/
exports.seedEventTagRelationships = function(json, env, callback) {
  // Query for taking json input and iterating on every index of allEvents array from JSON object
  // Then secondary iteration through all the tags attached at each relationship and creates event-tag relationship
  var query = [
    'WITH {json} as data',
    'UNWIND data.allEvents as allEvents',
    'FOREACH (event IN allEvents |',
    'FOREACH (tag IN event.tags |',
    'MERGE (e:Event {eventname: event.eventname})',
    'MERGE (t:Tag {tagname: tag})', 
    'CREATE (e)-[rel:is]->(t)))'
  ].join('\n');

  var params = {
    json: json
  }

  // Run the query for creating Event-Tag relationships
  db.cypher({
    query: query,
    params: params
  }, function(err, results) {
    if (err) {
      console.log("Error creating relationships between Events and Tags", err);
      callback(err, null);
    } else {
      console.log("Successfully seeded Event-Tags relationships in neo4j");
      callback(null, results);
    }
  });
}

// Promisifying these functions to handle asynchronous database writing
exports.seedEventsAsync = Promise.promisify(exports.seedEvents);
exports.seedEventTagRelationshipsAsync = Promise.promisify(exports.seedEventTagRelationships);