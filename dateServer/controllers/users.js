// users.js
// Routes to CRUD users.
var URL = require('url');
var Promise = require('bluebird');
var errors = require('../models/errors');
var User = require('../models/user');
var Tag = require('../models/tag');
var Event = require('../models/event');
var userAuthSQL = require('../models/userAuthSQL')
var userPrefsSQL = require('../models/userPrefSQL')

function getUserURL(user) {
  return '/users/' + encodeURIComponent(user.username);
}

/**
 * GET /users
 */
exports.list = function(req, res, next) {
  User.getAll(function(err, users) {
    if (err) return next(err);
    else return users;
  });
};

/**
 * POST /users {username, ...}
 */
exports.create = function(req, res, next) {
  //TODO: Remove usernames from Neo4j.
  console.log("In create user");
  var user = {
    username: req.body.email
  };
  var getUserName = function(){
    return user.username;
  }.bind(this);
  var tags = req.body.tags || {
    participant: 0,
    indoor: 0,
    crowded: 0,
    culture: 0,
    music: 0,
    sporty: 0,
    geeky: 0,
    foodie: 0
  };

  for (var tag in tags) {
    user[tag] = tags[tag];
  }
  User.create(user, function(err, user) {
    if (err) {
      if (err instanceof errors.ValidationError) {
      } else {
        return next(err, user);
      }
    }
    //console.log("User Created", user._node, user._node._id);
    User.get(getUserName(), function(err, user){
      userAuthSQL.post(user._node._id, req.body.email, function(err, user){
        if(err) {
          console.log(err);
        }
      });
    });
    res.sendStatus(200);
  });
};

/**
 * Function that, when passed a userName, returns a user Object from Neo4J
 */
exports.getMyUser = function(myUser){
  console.log("Getting the user: ", myUser.username);
  return new Promise(function(resolve, reject){
    User.get(myUser.username, function(err, user){
      if(err){
        console.log("there was an error getting the user in neo4j");
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
};

/**
 * GET /users/:username
 */
exports.show = function(req, res, next) {
  User.get(req.params.username, function(err, user) {
    // TODO: Gracefully "no such user" error. E.g. 404 page.
    if (err) return next(err);
    // TODO: Also fetch and show followers? (Not just follow*ing*.)
    user.getFollowingAndOthers(function(err, following, others) {
      if (err) return next(err);
      res.render('user', {
        User: User,
        user: user,
        following: following,
        others: others,
        username: req.query.username, // Support pre-filling edit form
        error: req.query.error, // Errors editing; see edit route
      });
    });
  });
};

/**
 * POST /users/:username {username, ...}
 */
exports.edit = function(req, res, next) {
  User.get(req.params.username, function(err, user) {
    // TODO: Gracefully "no such user" error. E.g. 404 page.
    if (err) return next(err);
    user.patch(req.body, function(err) {
      if (err) {
        if (err instanceof errors.ValidationError) {
          // Return to the edit form and show the error message.
          // TODO: Assuming username is the issue; hardcoding for that
          // being the only input right now.
          // TODO: It'd be better to use a cookie to "remember" this
          // info, e.g. using a flash session.
          return res.redirect(URL.format({
            pathname: getUserURL(user),
            query: {
              username: req.body.username,
              error: err.message,
            },
          }));
        } else {
          return next(err);
        }
      }
      res.redirect(getUserURL(user));
    });
  });
};

/**
 * DELETE /users/:username
 */
exports.del = function(req, res, next) {
  console.log('Deleting user: ' + req.params.username);

  User.get(req.params.username, function(err, user) {
    // TODO: Gracefully handle "no such user" error somehow.
    // E.g. redirect back to /users with an info message?
    if (err) return next(err);
    user.del(function(err) {
      if (err) return next(err);
      res.redirect('/users');
    });
  });
};

/**
 * POST /users/:username/follow {otherUsername}
 */
exports.follow = function(req, res, next) {
  User.get(req.params.username, function(err, user) {
    // TODO: Gracefully handle "no such user" error somehow.
    // This is the source user, so e.g. 404 page?
    if (err) return next(err);
    User.get(req.body.otherUsername, function(err, other) {
      // TODO: Gracefully handle "no such user" error somehow.
      // This is the target user, so redirect back to the source user w/
      // an info message?
      if (err) return next(err);
      user.follow(other, function(err) {
        if (err) return next(err);
        res.redirect(getUserURL(user));
      });
    });
  });
};

/**
 * POST /users/:username/tag {tagname}
 */
exports.tag = function(req, res, next) {


  User.get(req.params.username, function(err, user) {
    // TODO: Gracefully handle "no such user" error somehow.
    // This is the source user, so e.g. 404 page?
    if (err) return next(err);
    Tag.get(req.body.tagname, function(err, tag) {
      // TODO: Gracefully handle "no such user" error somehow.
      // This is the target user, so redirect back to the source user w/
      // an info message?
      if (err) return next(err);
      user.tag(tag, function(err) {
        if (err) return next(err);
        res.redirect(getUserURL(user));
      });
    });
  });
};

/**
 * POST /users/:username/untag {tagname}
 */
exports.untag = function(req, res, next) {
  User.get(req.params.username, function(err, user) {
    // TODO: Gracefully handle "no such user" error somehow.
    // This is the source user, so e.g. 404 page?

    if (err) return next(err);
    Tag.get(req.body.tagname, function(err, tag) {

      // TODO: Gracefully handle "no such user" error somehow.
      // This is the target user, so redirect back to the source user w/
      // an info message?

      if (err) return next(err);
      user.untag(tag, function(err) {
        if (err) return next(err);
        res.redirect('/users');
      });
    });
  });
};

/**
 * POST /users/:username/unfollow {otherUsername}
 */
exports.unfollow = function(req, res, next) {
  User.get(req.params.username, function(err, user) {
    // TODO: Gracefully handle "no such user" error somehow.
    // This is the source user, so e.g. 404 page?

    if (err) return next(err);
    User.get(req.body.otherUsername, function(err, other) {

      // TODO: Gracefully handle "no such user" error somehow.
      // This is the target user, so redirect back to the source user w/
      // an info message?

      if (err) return next(err);
      user.unfollow(other, function(err) {
        if (err) return next(err);
        res.redirect(getUserURL(user));
      });
    });
  });
};

/**
 * POST /users/:username/getAllTags
 * returns all tags related to this user
 */
exports.getAllTags = function(req, res, next) {
  User.get(req.params.username, function(err, user) {
    // TODO Handle error if user doesn't exist
    if (err) return next(err)
    user.getAllTags(function(err, tags) {
      if (err) return next(err);
      res.send(tags);
    });
  });
}

/**
 * POST /users/:username/getWeight
 * returns the weight of the tag
 */
exports.getTagWeight = function(req, res, next) {
  User.get(req.params.username, function(err, user) {
    // TODO: Gracefully handle "no such user" error somehow.
    // This is the source user, so e.g. 404 page?

    if (err) return next(err);
    Tag.get(req.body.tagName, function(err, tag) {

      // TODO: Gracefully handle "no such user" error somehow.
      // This is the target user, so redirect back to the source user w/
      // an info message?

      if (err) return next(err);
      user.getWeight(tag, function(err, results) {
        if (err) return next(err);
        var weight = results[0]["rel.weight"]
        res.send(weight)
      });
    });
  });
}


//given a user to tag relationship, increase the weight of that relationships.
//this is used to gauge the weight of date recommendations.
exports.increaseWeight = function(req, res, next) {
  User.get(req.params.username, function(err, user) {
    // TODO: Gracefully handle "no such user" error somehow.
    // This is the source user, so e.g. 404 page?

    if (err) return next(err);
    Tag.get(req.body.tagname, function(err, tag) {      

      // TODO: Gracefully handle "no such user" error somehow.
      // This is the target user, so redirect back to the source user w/
      // an info message?

      if (err) return next(err);
      user.increaseWeight(tag, function(err, results) {
        if (err) return next(err);
        res.send(results)
      });
    });
  });
}

//given a user to tag relationship, decrease the weight of that relationships.
//this is used to gauge the weight of date recommendations.
exports.decreaseWeight = function(req, res, next) {
  User.get(req.params.username, function(err, user) {
    // TODO: Gracefully handle "no such user" error somehow.
    // This is the source user, so e.g. 404 page?

    if (err) return next(err);
    Tag.get(req.body.tagname, function(err, tag) {

      // TODO: Gracefully handle "no such user" error somehow.
      // This is the target user, so redirect back to the source user w/
      // an info message?

      if (err) return next(err);
      user.decreaseWeight(tag, function(err, results) {
        if (err) return next(err);
        res.send(results)
      });
    });
  });
}


/*--------------------SQL---------------*/

exports.signupUserSQL = function(req, res, next){
  userAuthSQL.post(req.body.userID, req.body.userName)
  .then(function(user){
    res.status(201).send(user);
  });
}

exports.getUserID = function(req, res, next){
  userAuthSQL.get(req.query.userName)
  .then(function(user){
    res.status(200).send(user);
  })
}

exports.createUserPrefsSQL = function(req, res, next){
  userPrefsSQL.post(req.body.userID, req.body.dateIdeaID, req.body.likeDislike)
  .then(function(user){
    res.status(201).send(user);
  });
}

