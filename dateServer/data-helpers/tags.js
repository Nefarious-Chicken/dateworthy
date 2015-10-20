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

exports.seedTags = function(callback) {
  var createConstraintQuery = 'CREATE CONSTRAINT ON (tag:Tag) ASSERT tag.tagname IS UNIQUE';
  var query = [
    'LOAD CSV WITH HEADERS FROM "file://' + __dirname + '/tags.csv" AS csvLine',
    'CREATE (tag:Tag { tagname: csvLine.tags })'
	].join('\n');
  db.cypher({
    query: createConstraintQuery
  }, function(err, results) {
    if (err) {
      console.log("Couldn't create constraint on Tags graph", err);
      callback(err, null);
    } else {
      db.cypher({
        query: query
      }, function(err, results) {
        if (err) {
          callback(err, null);
        } else {
          if (results) {
            console.log("The results after running seedTags are", results);
            callback(null, results);
          }
        }
      }) 
    }
  })
};


exports.createConstraint = function(callback) {
  var createConstraintQuery = 'CREATE CONSTRAINT ON (tag:Tag) ASSERT tag.tagname IS UNIQUE';
   db.cypher({
    query: createConstraintQuery
  }, function(err, results) {
    if (err) {
      console.log("Couldn't create constraint on Tags graph", err);
      callback(err, null);
    } else {
      console.log("Success!");
    }
  })

}