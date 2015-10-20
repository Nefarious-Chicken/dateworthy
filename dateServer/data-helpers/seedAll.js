var tags = require('./tags');
var events = require('./events');
var util = require('./util');

tags.seedTags(function(err, results) {
	if (err) {
    console.log("There was an error seeding tags in the DB.", err);
  } else {
    console.log("Great job, the tag seeding worked!");
  }
});

events.seedEvents(function(err, results) {
  if(err) {
    console.log("There was an error seeding events in the DB.", err);
  } else {
    console.log("The events got seeded!");
  }
});

util.seedEventTagRelationships('./events.csv');

