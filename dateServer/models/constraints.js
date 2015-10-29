var db = require('./db');
var done = false;
// Register our unique eventname, username, tagname constraint.
// TODO: This is done async'ly (fire and forget) here for simplicity,
// but this would be better as a formal schema migration script or similar.

db.createConstraint({
    label: 'Event',
    property: 'eventname',
}, function (err, constraint) {
    console.log('(Trying to Register unique eventnames constraint.)', err);
    if (err){ console.log(err)}    // Failing fast for now, by crash the application.
    if (constraint) {
        console.log('(Registered unique eventnames constraint.)');
    } else {
        // Constraint already present; no need to log anything.
    }
    db.createConstraint({
      label: 'User',
      property: 'username',
    }, function(err, constraint) {
      if (err){console.log(err)}; // Failing fast for now, by crash the application.
      if (constraint) {
        console.log('(Registered unique usernames constraint.)');
      } else {
        // Constraint already present; no need to log anything.
      }

      db.createConstraint({
          label: 'Tag',
          property: 'tagname',
      }, function (err, constraint) {
          console.log('(Trying to Register unique tagnames constraint.)', err);
          if (err){console.log(err)}    // Failing fast for now, by crash the application.
          if (constraint) {
              console.log('(Registered unique tagnames constraint.)');
          } else {
              // Constraint already present; no need to log anything.
          }
          done = true;
      })
    });

});

require('deasync').loopWhile(function(){return !done;});