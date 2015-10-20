var neo4j = require('neo4j');
var errors = require('./errors');
var db = require('./db');

/**
 * Tag Model
 */
var Tag = module.exports = function Tag(_node) {
    this._node = _node;
}

Tag.VALIDATION_INFO = {
  'tagname': {
    required: true,
    minLength: 2,
    maxLength: 16,
    pattern: /^[A-Za-z0-9_]+$/,
    message: '2-16 characters; letters, numbers, and underscores only.'
  },
};

Object.defineProperty(Tag.prototype, 'tagname', {
    get: function () { return this._node.properties['tagname']; }
});

/**
 * Tag helper function to query db for tag with an associated tagname
 */
Tag.get = function (tagname, callback) {
    var query = [
        'MATCH (tag:Tag {tagname: {tagname}})',
        'RETURN tag',
    ].join('\n')

    var params = {
        tagname: tagname,
    };

    db.cypher({
        query: query,
        params: params,
    }, function (err, results) {
        if (err) return callback(err);
        if (!results.length) {
            err = new Error('No such tag with username: ' + tagname);
            return callback(err);
        }
        var tag = new Tag(results[0]['tag']);
        callback(null, tag);
    });
};

Tag.getAll = function (callback) {
  var query = [
    'MATCH (tag:Tag)',
    'RETURN tag',
  ].join('\n');

  db.cypher({
    query: query,
  }, function (err, results) {
    if (err) return callback(err);
    var tags = results.map(function (result) {
      return new Tag(result['tag']);
    });
    callback(null, tags);
  });
};

/**
 * Creates db entry with tagname property
 */
Tag.create = function (props, callback) {
    var query = [
        'CREATE (tag:Tag {props})',
        'RETURN tag',
    ].join('\n');

    var params = {
        props: props
    }

    db.cypher({
        query: query,
        params: params,
    }, function (err, results) {

        if (isConstraintViolation(err)) {
            // TODO: This assumes username is the only relevant constraint.
            // We could parse the constraint property out of the error message,
            // but it'd be nicer if Neo4j returned this data semantically.
            // Alternately, we could tweak our query to explicitly check first
            // whether the username is taken or not.
            err = new errors.ValidationError(
              'The tagname ‘' + props.tagname + '’ is taken.');
        }

        if (err) return callback(err);

        var tag = new Tag(results[0]['tag']);

        callback(null, tag);
    });
}

// var query = [
//   'CREATE (user:User {props})',
//   'RETURN user',
// ].join('\n');

// var params = {
//   props: props //validate(props)
// };

// db.cypher({
//   query: query,
//   params: params,
// }, function (err, results) {
//   if (isConstraintViolation(err)) {
//     // TODO: This assumes username is the only relevant constraint.
//     // We could parse the constraint property out of the error message,
//     // but it'd be nicer if Neo4j returned this data semantically.
//     // Alternately, we could tweak our query to explicitly check first
//     // whether the username is taken or not.
//     err = new errors.ValidationError(
//       'The username ‘' + props.username + '’ is taken.');
//   }
//   if (err) return callback(err);
//   var user = new User(results[0]['user']);
//   callback(null, user);
// });

Tag.prototype.del = function (callback) {
    // Use a Cypher query to delete both this user and his/her following
    // relationships in one query and one network request:
    // (Note that this'll still fail if there are any relationships attached
    // of any other types, which is good because we don't expect any.)
    var query = [
        'MATCH (tag:Tag {tagname: {tagname}})',
        'OPTIONAL MATCH (tag) -[rel:prefers]- (user)',
        'DELETE tag, rel',
    ].join('\n')

    var params = {
        tagname: this.tagname,
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

// Atomically updates this user, both locally and remotely in the db, with the
// given property updates.
Tag.prototype.patch = function (props, callback) {
  var safeProps = validate(props);

  var query = [
    'MATCH (tag:Tag {tagname: {tagname}})',
    'SET tag += {props}',
    'RETURN tag',
  ].join('\n');

  var params = {
    tagname: this.tagname,
    props: safeProps,
  };

  var self = this;

  db.cypher({
    query: query,
    params: params,
  }, function (err, results) {
    if (isConstraintViolation(err)) {
      // TODO: This assumes tagname is the only relevant constraint.
      // We could parse the constraint property out of the error message,
      // but it'd be nicer if Neo4j returned this data semantically.
      // Alternately, we could tweak our query to explicitly check first
      // whether the tagname is taken or not.
      err = new errors.ValidationError(   
        'The tagname ‘' + props.tagname + '’ is taken.');
    }
    if (err) return callback(err);

    if (!results.length) {
      err = new Error('Tag has been deleted! Tagname: ' + self.tagname);
      return callback(err);
    }

    // Update our node with this updated+latest data from the server:
    self._node = results[0]['tag'];

    callback(null);
  });
};


// Takes the given caller-provided properties, selects only known ones,
// validates them, and returns the known subset.
// By default, only validates properties that are present.
// (This allows `Tag.prototype.patch` to not require any.)
// You can pass `true` for `required` to validate that all required properties
// are present too. (Useful for `Tag.create`.)
function validate(props, required) {
    var safeProps = {};

    for (var prop in Tag.VALIDATION_INFO) {
        var val = props[prop];
        validateProp(prop, val, required);
        safeProps[prop] = val;
    }

    return safeProps;
}

// Validates the given property based on the validation info above.
// By default, ignores null/undefined/empty values, but you can pass `true` for
// the `required` param to enforce that any required properties are present.

//TODO move this function to utils for tag events and user
function validateProp(prop, val, required) {
  var info = Tag.VALIDATION_INFO[prop];
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

db.createConstraint({
    label: 'Tag',
    property: 'tagname',
}, function (err, constraint) {
    if (err) throw err;     // Failing fast for now, by crash the application.
    if (constraint) {
        console.log('(Registered unique tagnames constraint.)');
    } else {
        // Constraint already present; no need to log anything.
    }
})
