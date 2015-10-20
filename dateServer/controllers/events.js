var URL = require('url');

var errors = require('../models/errors');
var User = require('../models/user');
var Tag = require('../models/tag');
var Event = require('../models/event');

function getDateURL(date) {
  return '/dates/' + encodeURIComponent(date.datename);
}


/**
 * POST /events/:eventname {eventname, description...}
 */
exports.create = function(req, res, next) {
  Event.create({
    eventname: req.body.eventname,
    description: req.body.description
  }, function(err, tag) {
    if (err) {
      console.log('Error:');
      console.log(err);
      console.log('Error creating tag with tagname: ' + req.body.eventname);
      res.sendStatus(404);
    }

    console.log('Successfully created tag object');
    console.log(tag);
    res.redirect('/users');

  });
}

/**
 * DELETE /events/:eventname
 */
exports.del = function(req, res, next) {
  Event.get(req.params.eventname, function(err, event) {
    // TODO: Gracefully handle "no such user" error somehow.
    // E.g. redirect back to /users with an info message?
    if (err) return next(err);
    event.del(function(err) {
      if (err) return next(err);
      res.redirect('/users');
    });
  });
};

/**
 * POST /events/:eventname/tag {tagname}
 */
exports.tag = function(req, res, next) {

  console.log('Event to find in db: ' + req.params.eventname);
  console.log('Tagname to match to in db: ' + req.body.tagname);

  Event.get(req.params.eventname, function(err, event) {
    // TODO: Gracefully handle "no such user" error somehow.
    // This is the source user, so e.g. 404 page?
    if (err) return next(err);
    Tag.get(req.body.tagname, function(err, tag) {
      // TODO: Gracefully handle "no such user" error somehow.
      // This is the target user, so redirect back to the source user w/
      // an info message?
      if (err) return next(err);
      event.tag(tag, function(err) {
        if (err) return next(err);
        res.redirect('/users');
      });
    });
  });
};

/**
 * POST /events/:eventname/untag {tagname}
 */
exports.untag = function(req, res, next) {
  Event.get(req.params.eventname, function(err, event) {
    // TODO: Gracefully handle "no such user" error somehow.
    // This is the source user, so e.g. 404 page?

    if (err) return next(err);
    Tag.get(req.body.tagname, function(err, tag) {

      // TODO: Gracefully handle "no such user" error somehow.
      // This is the target user, so redirect back to the source user w/
      // an info message?

      if (err) return next(err);
      event.untag(tag, function(err) {
        if (err) return next(err);
        res.redirect('/users');
      });
    });
  });
};