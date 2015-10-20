var neo4j = require('neo4j');
var errors = require('../models/errors');
var Tag = require('../models/tag');
var Event = require('../models/event');
var db = require('../models/db');
var path = require('path');

// query: LOAD CSV WITH HEADERS FROM "http://neo4j.com/docs/2.2.6/csv/import/persons.csv" AS csvLine
// CREATE (p:Person { id: toInt(csvLine.id), name: csvLine.name })

exports.seedEvents = function(callback) {
  var createConstraintQuery = 'CREATE CONSTRAINT ON (event:Event) ASSERT event.eventname IS UNIQUE';

  var props = [
    'eventname: csvLine.event + " at " + csvLine.venueCategory,',
    'fsCategory: csvLine.fsCategory,',
    'event: csvLine.event,',
    'venueCategory: csvLine.venueCategory'
  ].join(' ');

  
  var query = [
    'LOAD CSV WITH HEADERS FROM "file://' + __dirname + '/events.csv" AS csvLine',
    'CREATE (event:Event { ' + props + ' } )'
  ].join('\n');
  db.cypher({
    query: createConstraintQuery
  }, function(err, results) {
    if (err) {
      console.log("Couldn't create constraint on Events graph", err);
      callback(err, null);
    } else {
      db.cypher({
        query: query
      }, function(err, results) {
        if (err) {
          callback(err, null);
        } else {
          if (results) {
            console.log("The results after running seedEvents are", results);
            callback(null, results);
          }
        }
      }) 
    }
  })
};

exports.seedEventTagRelationships = function(json, callback) {
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

  db.cypher({
    query: query,
    params: params
  }, function(err, results) {
    if (err) {
      console.log("Error creating relationships", err);
      callback(err, null);
    } else {
      console.log("The results after running seedEventTagRelationships are", results);
      callback(null, results);
    }
  });
}
