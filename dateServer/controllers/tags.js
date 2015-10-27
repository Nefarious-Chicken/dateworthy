var URL = require('url');
var errors = require('../models/errors');
var User = require('../models/user');
var Tag = require('../models/tag');
var Events = require('./events');

function getTagURL(tag) {
  return '/tags/' + encodeURIComponent(tag.tagname);
}


/**
 * POST /sendTags {tagname}
 * creates a list of venue categories based on tags submitted by the client.
 */
exports.sendDateData = function(req, res, next) {
  //console.log(req.body);

  var tags = {};

  var rawGeo = req.body.geoLocation;
  if(rawGeo !== null){
    //reformat geo to follow correct format '37.78,-122.41'
    var geoLocation = '' + rawGeo.lat.toFixed(2) + ',' + rawGeo.long.toFixed(2);
  }
  for(var i=0; i < req.body.tags.length; i++){
    tags[req.body.tags[i]] = 1;
  }

  console.log('Tags: ', tags);
  Events.getMatchingEventsNoRest(tags, geoLocation, req, res);
};

/**
 * POST /tags {tagname}
 */
exports.create = function(req, res, next) {
  Tag.create({
    tagname: req.body.tagname
  }, function(err, tag) {
    if (err) {
      console.log('Error:');
      console.log(err);
      console.log('Error creating tag with tagname: ' + req.body.tagname);
      res.sendStatus(404);
    }

    console.log('Successfully created tag object');
    console.log(tag);
    res.redirect('/users');

  });
};

/**
 * DELETE /tags/:tagname
 */
exports.del = function(req, res, next) {
  console.log('Start delete task');
  console.log('Deleting tagname: ' + req.params.tagname);

  Tag.get(req.params.tagname, function(err, tag) {
    // TODO: Gracefully handle "no such user" error somehow.
    // E.g. redirect back to /users with an info message?
    console.log('Error:');
    console.log(err);

    console.log('Tag returned from get:');
    console.log(tag);

    if (err) return next(err);
    tag.del(function(err) {
      if (err) return next(err);
      res.redirect('/users');
    });
  });
};
