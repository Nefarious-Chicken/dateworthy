var neo4j = require('neo4j');
var errors = require('../models/errors');
var Tag = require('../models/tag');
var Event = require('../models/event');
var db = require('../models/db');
var path = require('path');
var Promise = require('bluebird');

/** HELPER FUNCTON
* Purpose: Seeding all tags and its associated properties from a csv into neo4j
*/
exports.seedTags = function(callback) {
  // Query for creating a constraint on a node's eventname so nodes with the same eventname can't be created
  var createConstraintQuery = 'CREATE CONSTRAINT ON (tag:Tag) ASSERT tag.tagname IS UNIQUE';
  
  // General query for reading each line from the csv and creating a Tag node based on line contents
  var query = [
    'LOAD CSV WITH HEADERS FROM "http://dateworthy.heroku.com/events.csv" AS csvLine',
    'CREATE (tag:Tag { tagname: csvLine.tags })'
	].join('\n');

  // Run the constraint creation query
  db.cypher({
    query: createConstraintQuery
  }, function(err, results) {
    if (err) {
      console.log("Couldn't create constraint on Tags graph", err);
      callback(err, null);
    } else {
      // Run the query for creating Events
      db.cypher({
        query: query
      }, function(err, results) {
        if (err) {
          console.log("Error creating Tag nodes in neo4j", err);
          callback(err, null);
        } else {
          if (results) {
            console.log("Successfully created Tag nodes in neo4j");
            callback(null, results);
          }
        }
      }); 
    }
  });
};

// Promisifying these functions to handle asynchronous database writing
exports.seedTagsAsync = Promise.promisify(exports.seedTags);