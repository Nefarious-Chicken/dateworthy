var neo4j = require('neo4j');
var errors = require('./errors');
var db = require('./db');

//Event model
/** TABLE OF CONTENTS:
 * PRIVATE CONSTRUCTOR
 * var Event
 *
 * PUBLIC INSTANCE METHODS
 * Event.prototype.del - Delete an event from DB
 * Event.prototype.tag - Associate an event with a tag
 * Event.prototype.untag - Dissociate an event from a tag
 *
 * STATIC METHODS
 * Event.get - Query for returning a single event with a given eventname
 * Event.create - Create a new event in the db
 */

// PRIVATE CONSTRUCTOR
var Event = module.exports = function Event(_node) {
    this._node = _node;
}
var Tag = require('../models/tag');


// Public constants:

Event.VALIDATION_INFO = {
  'eventname': {
    required: true,
    minLength: 2,
    maxLength: 16,
    pattern: /^[A-Za-z0-9_]+$/,
    message: '2-16 characters; letters, numbers, and underscores only.'
  },
};

// Public instance properties:
Object.defineProperty(Event.prototype, 'eventname', {
    get: function () { return this._node.properties['eventname']; }
});


// Private helpers:

// Takes the given caller-provided properties, selects only known ones,
// validates them, and returns the known subset.
// By default, only validates properties that are present.
// (This allows `Event.prototype.patch` to not require any.)
// You can pass `true` for `required` to validate that all required properties
// are present too. (Useful for `Event.create`.)
function validate(props, required) {
    var safeProps = {};

    for (var prop in Event.VALIDATION_INFO) {
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
  var info = Event.VALIDATION_INFO[prop];
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

// Helper function to check that Event exists
Event.get = function (eventname, callback) {
    var query = [
        'MATCH (event:Event {eventname: {eventname}})',
        'RETURN event',
    ].join('\n')

    var params = {
        eventname: eventname
    };

    db.cypher({
        query: query,
        params: params,
    }, function (err, results) {
        if (err) return callback(err);
        if (!results.length) {
            err = new Error('No such event with eventname: ' + eventname);
            return callback(err);
        }
        var event = new Event(results[0]['event']);
        callback(null, event);
    });
};
//returns all events
Event.getAll = function (callback) {
  var query = [
    'MATCH (event:Event)',
    'RETURN event',
  ].join('\n');

  db.cypher({
    query: query,
  }, function (err, results) {
    if (err) return callback(err);
    var events = results.map(function (result) {
      return new Event(result['event']);
    });
    callback(null, events);
  });
};

Event.create = function (props, callback) {
    var query = [
        'CREATE (event:Event {props})',
        'RETURN event',
    ].join('\n');

    var params = {
        props: props
    }

    db.cypher({
        query: query,
        params: params,
    }, function (err, results) {
        if (err) return callback(err);

        var event = new Event(results[0]['event']);

        callback(null, event);
    });
}

Event.prototype.del = function (callback) {
    // Use a Cypher query to delete both this event and his/her following
    // relationships in one query and one network request:
    // (Note that this'll still fail if there are any relationships attached
    // of any other types, which is good because we don't expect any.)
    var query = [
        'MATCH (event:Event {eventname: {eventname}})',
        'OPTIONAL MATCH (event) -[rel:is]- (tag)',
        'DELETE event, rel',
    ].join('\n')

    var params = {
        eventname: this.eventname,
    };

    // console.log('Param to pass into query:');
    // console.log(params);

    // console.log('Constructed Query:');
    // console.log(query);

    db.cypher({
        query: query,
        params: params,
    }, function (err) {
        callback(err);
    });
};

Event.prototype.tag = function (tag, callback) {
    var query = [
        'MATCH (event:Event {eventname: {thisEventname}})',
        'MATCH (tag:Tag {tagname: {targetTagname}})',
        'MERGE (event) -[rel:is]-> (tag)',
    ].join('\n')
    var params = {
        thisEventname: this.eventname,
        targetTagname: tag.tagname,
    };

    db.cypher({
        query: query,
        params: params,
    }, function (err) {
        callback(err);
    });
};


Event.prototype.untag = function (tag, callback) {
    var query = [
        'MATCH (event:Event {eventname: {thisEventname}})',
        'MATCH (tag:Tag {tagname: {targetTagname}})',
        'MATCH (event) -[rel:is]-> (tag)',
        'DELETE rel',
    ].join('\n')

    var params = {
        thisEventname: this.eventname,
        targetTagname: tag.tagname,
    };

    db.cypher({
        query: query,
        params: params,
    }, function (err, results) {
        callback(err);
    });
};

Event.prototype.patch = function (props, callback) {
  var safeProps = validate(props);

  var query = [
    'MATCH (event:Event {eventname: {eventname}})',
    'SET event += {props}',
    'RETURN event',
  ].join('\n');

  var params = {
    eventname: this.eventname,
    props: safeProps,
  };

  var self = this;

  db.cypher({
    query: query,
    params: params,
  }, function (err, results) {
    if (isConstraintViolation(err)) {
      // TODO: This assumes eventname is the only relevant constraint.
      // We could parse the constraint property out of the error message,
      // but it'd be nicer if Neo4j returned this data semantically.
      // Alternately, we could tweak our query to explicitly check first
      // whether the eventname is taken or not.
      err = new errors.ValidationError(   
        'The eventname ‘' + props.eventname + '’ is taken.');
    }
    if (err) return callback(err);

    if (!results.length) {
      err = new Error('Event has been deleted! Eventname: ' + self.eventname);
      return callback(err);
    }

    // Update our node with this updated+latest data from the server:
    self._node = results[0]['event'];

    callback(null);
  });
};


// Returns all tags a event has associated with themselves
Event.prototype.getAllTags = function (callback) {
  var query = [
    'MATCH (event:Event {eventname: {thisEventname}})-[:is]->(tag:Tag)',
    'RETURN DISTINCT tag'
  ].join('\n')

  var params = {
    thisEventname: this.eventname
  }

  db.cypher({
    query: query,
    params: params
  }, function (err, results) {
    if (err) return callback(err);
    // console.log("Results from tag query based on event");
    // console.log(results);
    var tags = results.map(function (result) {
      return new Tag(result['tag']);
    });
    callback(null, tags);
  });
};


// Given a profile, find matching events with that profile {'tag1': 1, 'tag2': 0, 'tag3': 1...}
Event.getMatchingEvents = function(profile, callback) {
  var query = ['MATCH'];
  var where = 'WHERE ';
  var count = 0;
  for (var tag in profile) {
    if (profile[tag] === 1) {
      count++;
      where += "tag" + count + ".tagname =~ \"" + tag + "\" AND ";
      query.push('(event:Event)-[:is]->(tag' + count + ':Tag),');
    }
  }
  var lastEventRelation = query[query.length - 1];
  //remove unecessary comma from last match statement
  query[query.length - 1] = lastEventRelation.substring(0, lastEventRelation.length - 1)
    //remove unecessary AND statement and space
  where = where.substring(0, where.length - 4);
  query.push(where);
  query.push('RETURN event as event;');
  query = query.join('\n');
  console.log("The query is", query);
  db.cypher({
    query: query,
  }, function(err, results) {
    if (err) return callback(err);
    var events = results.map(function(result) {
      return new Event(result['event']);
    });
    callback(null, events);
  });
}

// Register our unique eventname constraint.
// TODO: This is done async'ly (fire and forget) here for simplicity,
// but this would be better as a formal schema migration script or similar.
db.createConstraint({
    label: 'Event',
    property: 'eventname',
}, function (err, constraint) {
    if (err) throw err;     // Failing fast for now, by crash the application.
    if (constraint) {
        console.log('(Registered unique eventnames constraint.)');
    } else {
        // Constraint already present; no need to log anything.
    }
});