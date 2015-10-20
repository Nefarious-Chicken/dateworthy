var tags = require('./tags');
var events = require('./events');
var util = require('./util');

events.seedEvents(function(err, results) {
  if(err) {
    console.log("There was an error seeding events in the DB.", err);
  } else {
    console.log("The events got seeded!");
  }
});

util.seedEventTagRelationships('./events.csv');

