// user.js
// User model logic.
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

var tags = {
  'Indoor': true, 
  'Outdoor': true, 
  'Day': true, 
  'Night': true, 
  'Sporty': true, 
  'Visual': true, 
  'Artistic': true, 
  'Culinary': true, 
  'Crowded': true, 
  'Party': true, 
  'Observer': true, 
  'Nature': true, 
  'Wet': true, 
  'Geeky': true, 
  'Fancy': true, 
  'Loud': true, 
  'Quiet': true, 
  'Intellectual': true, 
  'Tactile': true, 
  'Expensive': true, 
  'Cheap': true, 
  'Free': true, 
  'Romantic': true, 
  'Goofy': true, 
  'Game-related': true, 
  'Creative': true, 
  'Illegal': true, 
  'First-date': true, 
  'Summer': true, 
  'Winter': true, 
  'Seasonal': true, 
  'Historical': true, 
  'Hair-raising': true, 
}