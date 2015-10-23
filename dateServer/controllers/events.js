var URL = require('url');

var errors = require('../models/errors');
var User = require('../models/user');
var Tag = require('../models/tag');
var Event = require('../models/event');
var Promise = require('bluebird');
var config = require('../secret/config');


var clientID = config.clientID;
var clientSecret = config.clientSecret;
var foursquare = require('node-foursquare-venues')(clientID, clientSecret);

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


exports.getMatchingEvents = function(req, res, next) {
  console.log('Routing correctly');
  Event.getMatchingEvents(req.body.profile, function(err, events) {
    if (err) return next(err);
    exports.getFoursquareVenues(events, res);
    // res.send(events);
  })
}

exports.getMatchingEventsNoRest = function(tags, req, res) {
  console.log('Routing correctly');
  Event.getMatchingEvents(tags, function(err, events) {
    if (err) {
      return res.status(500).send(err);
    }
    if(events.length === 0){
      var ideas = {
        ideaArray: [
          {idea: "Frisbee in Dolores", liked: 0, disliked: 0},
          {idea: "Get schwasted at Branch and Bourbon", liked: 0, disliked: 0},
          {idea: "Kiss in the middle of the Golden Gate Bridge", liked: 0, disliked: 0}
        ]
      };
      return res.status(200).send(ideas);
    } else {
      exports.getFoursquareVenues(events, res);
    }
    // res.send(events);
  })
}

exports.getFoursquareVenues = function(events, res) {

  var ideas = {
    ideaArray: []
  };

  console.log('Events: ', events);

  var searchObj1 = {
    ll: '37.78,-122.41',
    categoryId: events[0].fsCategory,
    intent: 'browse',
    radius: '5000'
  };

  var searchObj2 = {
    ll: '37.78,-122.41',
    categoryId: events[1].fsCategory,
    intent: 'browse',
    radius: '5000'
  };

  var searchObj3 = {
    ll: '37.78,-122.41',
    categoryId: events[2].fsCategory,
    intent: 'browse',
    radius: '5000'
  };

  var venueSearch = function (searchObj, ideas, eventIndex) {
    var venuePromise = new Promise(function(resolve, reject) {
      foursquare.venues.search(searchObj, function(err, result) {
        if (err) {
          console.log("There was an error!", err);
          reject(err);
        } else {
          // console.log("Here is the result!",  result.response.venues);
          var venues = result.response.venues;
          var venueIndex = Math.floor(Math.random() * venues.length);
          var idea = {idea: events[eventIndex]._node.properties.event + ' at ' + venues[venueIndex].name, liked: 0, disliked: 0};
          ideas.ideaArray.push(idea);
          resolve(ideas);
        }
      });
    });
    return venuePromise; 
  }

  var venueSearchAsync = Promise.promisify(venueSearch);

  venueSearch(searchObj1, {ideaArray: []}, 0)
  .then(function(ideas) {
    return venueSearch(searchObj2, ideas, 1)
  })
  .then(function(ideas) {
    return venueSearch(searchObj3, ideas, 2)
  })
  .then(function(ideas){
    res.status(200).send(ideas);
  })

};