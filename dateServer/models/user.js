// user.js
// User model logic.
var neo4j = require('neo4j');
var errors = require('./errors');
var Tag = require('./tag');
var Event = require('./event');
var db = require('./db');

/** TABLE OF CONTENTS:
 * PRIVATE CONSTRUCTOR
 * var User
 *
 * PUBLIC INSTANCE METHODS
 * User.prototype.patch - Update a user
 * User.prototype.del - Delete a user from DB
 * User.prototype.tag - Associate a user with a tag
 * User.prototype.untag - Dissociate a user from a tag
 * User.prototype.follow - Associate a user with another user
 * User.prototype.unfollow - Dissociate a user from another user
 * User.prototype.getFollowingAndOthers - List all users the user is associated with
 * User.prototype.getAllTags - List all tags the user is associated with
 *
 * STATIC METHODS
 * User.get - Query for returning a single user with a given username
 * User.getAll - Return all users in the db
 * User.create - Create a new user in the db
 * User.getMatchingEvents - Find an event matching a given tag profile input
 */


// PRIVATE CONSTRUCTOR

var User = module.exports = function User(_node) {
  // All we'll really store is the node; the rest of our properties will be
  // derivable or just pass-through properties (see below).
  this._node = _node;
};

// PUBLIC CONSTANTS

User.VALIDATION_INFO = {
  'username': {
    required: true,
    minLength: 2,
    maxLength: 16,
    pattern: /^[A-Za-z0-9_]+$/,
    message: '2-16 characters; letters, numbers, and underscores only.'
  },
};

// PUBLIC INSTANCE PROPERTIES

// The user's username, e.g. 'aseemk'.
Object.defineProperty(User.prototype, 'username', {
  get: function() {
    return this._node.properties['username'];
  }
});

// PRIVATE HELPERS

// Takes the given caller-provided properties, selects only known ones,
// validates them, and returns the known subset.
// By default, only validates properties that are present.
// (This allows `User.prototype.patch` to not require any.)
// You can pass `true` for `required` to validate that all required properties
// are present too. (Useful for `User.create`.)
function validate(props, required) {
  var safeProps = {};

  for (var prop in User.VALIDATION_INFO) {
    var val = props[prop];
    validateProp(prop, val, required);
    safeProps[prop] = val;
  }

  return safeProps;
}

// Validates the given property based on the validation info above.
// By default, ignores null/undefined/empty values, but you can pass `true` for
// the `required` param to enforce that any required properties are present.
function validateProp(prop, val, required) {
  var info = User.VALIDATION_INFO[prop];
  var message = info.message;

  if (!val) {
    if (info.required && required) {
      throw new errors.ValidationError(
        'Missing ' + prop + ' (required).');
    } else {
      return;
    }
  }

  if (info.minLength && val.length < info.minLength) {
    throw new errors.ValidationError(
      'Invalid ' + prop + ' (too short). Requirements: ' + message);
  }

  if (info.maxLength && val.length > info.maxLength) {
    throw new errors.ValidationError(
      'Invalid ' + prop + ' (too long). Requirements: ' + message);
  }

  if (info.pattern && !info.pattern.test(val)) {
    throw new errors.ValidationError(
      'Invalid ' + prop + ' (format). Requirements: ' + message);
  }
}

function isConstraintViolation(err) {
  return err instanceof neo4j.ClientError &&
    err.neo4j.code === 'Neo.ClientError.Schema.ConstraintViolation';
}

// PUBLIC INSTANCE METHODS

// Automically updates this user, both locally and remotely in the db, with the
// given property updates.
User.prototype.patch = function(props, callback) {
  var safeProps = validate(props);

  var query = [
    'MATCH (user:User {username: {username}})',
    'SET user += {props}',
    'RETURN user',
  ].join('\n');

  var params = {
    username: this.username,
    props: safeProps,
  };

  var self = this;

  db.cypher({
    query: query,
    params: params,
  }, function(err, results) {
    if (isConstraintViolation(err)) {
      // TODO: This assumes username is the only relevant constraint.
      // We could parse the constraint property out of the error message,
      // but it'd be nicer if Neo4j returned this data semantically.
      // Alternately, we could tweak our query to explicitly check first
      // whether the username is taken or not.
      err = new errors.ValidationError(
        'The username ‘' + props.username + '’ is taken.');
    }
    if (err) return callback(err);

    if (!results.length) {
      err = new Error('User has been deleted! Username: ' + self.username);
      return callback(err);
    }

    // Update our node with this updated+latest data from the server:
    self._node = results[0]['user'];

    callback(null);
  });
};

// Deletes the user from db
User.prototype.del = function(callback) {
  // Use a Cypher query to delete both this user and his/her following
  // relationships in one query and one network request:
  // (Note that this'll still fail if there are any relationships attached
  // of any other types, which is good because we don't expect any.)
  var query = [
    'MATCH (user:User {username: {username}})',
    'OPTIONAL MATCH (user) -[userRel:follows]- (other)',
    'OPTIONAL MATCH (user) -[userTagRel:prefers]- (tag)',
    'DELETE user, userRel, userTagRel',
  ].join('\n')

  var params = {
    username: this.username,
  };

  db.cypher({
    query: query,
    params: params,
  }, function(err) {
    callback(err);
  });
};

User.prototype.getTag = function(tag, callback) {
  var query = [
    'MATCH (user:User {username: {thisUsername}})',
    'MATCH (tag:Tag {tagname: {targetTagname}})',
    'MATCH (user) -[rel:prefers]-> (tag)',
    'RETURN user',
  ].join('\n');

  var params = {
    thisUsername: this.username,
    targetTagname: tag.tagname,
  };

  db.cypher({
    query: query,
    params: params,
  }, function(err, results) {
    callback(err);
    if (!results.length) {
      callback(null, [])
    } else {
      callback(null, results);
    }
  });
};

// Associates this user with a certain tag
User.prototype.tag = function(tag, callback) {
  
  var query = [
    'MATCH (user:User {username: {thisUsername}})',
    'MATCH (tag:Tag {tagname: {targetTagname}})',
    'CREATE (user) -[rel:prefers{weight: 1}]-> (tag)',
  ].join('\n')

  var params = {
    thisUsername: this.username,
    targetTagname: tag.tagname,
  };
  this.getTag(tag, function(err, results){
    if(results === undefined){

    } else {
      if (results.length === 0){

        db.cypher({
          query: query,
          params: params,
        }, function(err) {
          callback(err);
        });
      }
    }
  })
};

// Dissociates this user from a certain tag
User.prototype.untag = function(tag, callback) {
  var query = [
    'MATCH (user:User {username: {thisUsername}})',
    'MATCH (tag:Tag {tagname: {targetTagname}})',
    'MATCH (user) -[rel:prefers]-> (tag)',
    'DELETE rel',
  ].join('\n');

  var params = {
    thisUsername: this.username,
    targetTagname: tag.tagname,
  };

  db.cypher({
    query: query,
    params: params,
  }, function(err) {
    callback(err);
  });
};

//get the weight property on the user preference tag
User.prototype.getTagWeight = function(tag, callback) {
  var query = [
    'MATCH (user:User {username: {thisUsername}})',
    'MATCH (tag:Tag {tagname: {targetTagname}})',
    'MATCH (user) -[rel:prefers]-> (tag)',
    'RETURN rel.weight'
  ].join('\n');

  var params = {
    thisUsername: this.username,
    targetTagname: tag.tagname,
  };
  db.cypher({
    query: query,
    params: params,
  }, function(err, results) {
    callback(err, results[0]["rel.weight"]);
  });
};

//increase the weight property on the user preference tag
User.prototype.increaseWeight = function(tag, callback) {
  var query = [
    'MATCH (user:User {username: {thisUsername}})',
    'MATCH (tag:Tag {tagname: {targetTagname}})',
    'MATCH (user) -[rel:prefers]-> (tag)',
    'SET rel.weight = rel.weight + 1'
  ].join('\n');

  var params = {
    thisUsername: this.username,
    targetTagname: tag.tagname,
  };

  db.cypher({
    query: query,
    params: params,
  }, function(err) {
    callback(err);
  });
};

//decrease the weight property on the user preference tag
User.prototype.decreaseWeight = function(tag, callback) {
  var query = [
    'MATCH (user:User {username: {thisUsername}})',
    'MATCH (tag:Tag {tagname: {targetTagname}})',
    'MATCH (user) -[rel:prefers]-> (tag)',
    'SET rel.weight= rel.weight - 1'
  ].join('\n');

  var params = {
    thisUsername: this.username,
    targetTagname: tag.tagname,
  };

  db.cypher({
    query: query,
    params: params,
  }, function(err) {
    callback(err);
  });
};



// Associates this user with another user
User.prototype.follow = function(other, callback) {
  var query = [
    'MATCH (user:User {username: {thisUsername}})',
    'MATCH (other:User {username: {otherUsername}})',
    'MERGE (user) -[rel:follows]-> (other)',
  ].join('\n');

  var params = {
    thisUsername: this.username,
    otherUsername: other.username,
  };

  db.cypher({
    query: query,
    params: params,
  }, function(err) {
    callback(err);
  });
};

// Dissociates this user from another user
User.prototype.unfollow = function(other, callback) {
  var query = [
    'MATCH (user:User {username: {thisUsername}})',
    'MATCH (other:User {username: {otherUsername}})',
    'MATCH (user) -[rel:follows]-> (other)',
    'DELETE rel',
  ].join('\n');

  var params = {
    thisUsername: this.username,
    otherUsername: other.username,
  };

  db.cypher({
    query: query,
    params: params,
  }, function(err) {
    callback(err);
  });
};

// Calls callback w/ (err, following, others), where following is an array of
// users this user follows, and others is all other users minus him/herself.
User.prototype.getFollowingAndOthers = function(callback) {
  // Query all users and whether we follow each one or not:
  var query = [
    'MATCH (user:User {username: {thisUsername}})',
    'MATCH (other:User)',
    'OPTIONAL MATCH (user) -[rel:follows]-> (other)',
    'RETURN other, COUNT(rel)', // COUNT(rel) is a hack for 1 or 0
  ].join('\n');

  var params = {
    thisUsername: this.username,
  };

  var user = this;
  db.cypher({
    query: query,
    params: params,
  }, function(err, results) {
    if (err) return callback(err);

    var following = [];
    var others = [];

    for (var i = 0; i < results.length; i++) {
      var other = new User(results[i]['other']);
      var follows = results[i]['COUNT(rel)'];

      if (user.username === other.username) {
        continue;
      } else if (follows) {
        following.push(other);
      } else {
        others.push(other);
      }
    }

    callback(null, following, others);
  });
};

// Returns all tags a user has associated with themselves
User.prototype.getAllTags = function(callback) {
  var query = [
    'MATCH (user:User {username: {thisUsername}})-[:prefers]->(tag:Tag)',
    'RETURN DISTINCT tag'
  ].join('\n');

  var params = {
    thisUsername: this.username
  };

  db.cypher({
    query: query,
    params: params
  }, function(err, results) {
    if (err) return callback(err);

    var tags = results.map(function(result) {
      return new Tag(result['tag']);
    });
    callback(null, tags);
  });
};

// STATIC METHODS

// Returns a user with the given username from db if the user exists
User.get = function(username, callback) {
  var query = [
    'MATCH (user:User {username: {username}})',
    'RETURN user',
  ].join('\n');

  var params = {
    username: username,
  };

  db.cypher({
    query: query,
    params: params,
  }, function(err, results) {
    if (err) return callback(err);
    if (!results.length) {
      err = new Error('No such user with username: ' + username);
      return callback(err);
    }
    var user = new User(results[0]['user']);
    callback(null, user);
  });
};

// Return all users in the db
User.getAll = function(callback) {
  var query = [
    'MATCH (user:User)',
    'RETURN user',
  ].join('\n');

  db.cypher({
    query: query,
  }, function(err, results) {
    if (err) return callback(err);
    var users = results.map(function(result) {
      return new User(result['user']);
    });
    callback(null, users);
  });
};


// Creates the user and persists (saves) it to the db, incl. indexing it
User.create = function(props, callback) {
  var query = [
    'CREATE (user:User {props})',
    'RETURN user',
  ].join('\n');

  //console.log("Props: ", props);
  var params = {
    props: props //validate(props)
  };

  db.cypher({
    query: query,
    params: params,
  }, function(err, results) {
    if (isConstraintViolation(err)) {
      // TODO: This assumes username is the only relevant constraint.
      // We could parse the constraint property out of the error message,
      // but it'd be nicer if Neo4j returned this data semantically.
      // Alternately, we could tweak our query to explicitly check first
      // whether the username is taken or not.
      err = new errors.ValidationError(
        'The username ‘' + props.username + '’ is taken.');
    }
    if (err) return callback(err);
    var user = new User(results[0]['user']);
    callback(null, user);
  });
};

// Given a profile, find matching events with that profile {tag1:1, tag2:0, tag3:1...}
User.getMatchingEvents = function(profileString, callback) {
  //sample input profileString {"sporty":1,"outdoors":1,"test":0}
  var query = ['MATCH'];
  var where = 'WHERE ';
  var count = 0;
  var profile = JSON.parse(profileString);
  for (var tag in profile) {
    if (profile[tag] === 1) {
      count++;
      where += "tag" + count + ".tagname =~ \"" + tag + "\" AND ";
      query.push('(event:Event)-[:is]->(tag' + count + ':Tag),');
    }
  }
  var lastEventRelation = query[query.length - 1];
  //remove unecessary comma from last match statement
  query[query.length - 1] = lastEventRelation.substring(0, lastEventRelation.length - 1);
    //remove unecessary AND statement and space
  where = where.substring(0, where.length - 4);
  query.push(where);
  query.push('RETURN event.eventname as event;');
  query = query.join('\n');
  db.cypher({
    query: query,
  }, function(err, results) {
    if (err) return callback(err);
    var events = results.map(function(result) {
      return new Event(result['event']);
    });
    callback(null, events);
  });
};


// STATIC INITIALIZATION

// Register our unique username constraint.
// TODO: This is done async'ly (fire and forget) here for simplicity,
// but this would be better as a formal schema migration script or similar.
db.createConstraint({
  label: 'User',
  property: 'username',
}, function(err, constraint) {
  if (err) throw err; // Failing fast for now, by crash the application.
  if (constraint) {
    console.log('(Registered unique usernames constraint.)');
  } else {
    // Constraint already present; no need to log anything.
  }
});
