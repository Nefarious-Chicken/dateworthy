var tags = require('./tags');

tags.createConstraint(function(err, results) {
	if (err) {
    console.log("There was an error seeding tags in the DB.", err);
  } else {
    console.log("Great job, the tag seeding worked!");
  }
});