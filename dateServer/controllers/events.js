var URL = require('url');

var errors = require('../models/errors');
var User = require('../models/user');
var Tag = require('../models/tag');
var Event = require('../models/event');
var Promise = require('bluebird');
var config = require('../secret/config');


var clientID = process.env.FS_ID|| config.clientID;
var clientSecret = process.env.FS_SECRET || config.clientSecret;
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
          {idea: "Play frisbee at Mission Dolores Park", liked: 0, disliked: 0, imgUrl: 'https://irs3.4sqi.net/img/general/960x720/17160664_1pVXH9Lf1AGEF9GiADPhnKDn05nHwEazTCk8XdZr_OQ.jpg'},
          {idea: "Get schwasted at Bourbon & Branch", liked: 0, disliked: 0, imgUrl:'https://irs2.4sqi.net/img/general/960x720/44636481_XKzA8WwCQan1LueBpfLoHrVDC1rUGfIb6rtq4zMx5fU.jpg' },
          {idea: "Kiss in the middle of the Golden Gate Bridge", liked: 0, disliked: 0, imgUrl: 'https://irs2.4sqi.net/img/general/612x612/21220925_aayAh4Nd5fVrcfYx_i1mQ6vKFXhAVqNvDEHqT0JVvl4.jpg' }
        ]
      };
      return res.status(200).send(ideas);
    } else {
      var limit = 3;
      exports.getFoursquareVenues(events, res, limit);
    }
    // res.send(events);
  })
}

exports.getFoursquareVenues = function(events, res, limit) {
  var ideas = { ideaArray: [] };
  var searchIndices = [];
  var promises = [];

  // Randomly select x (limit parameter of this function) number of indices in events input
  // This will choose the categoryId we will query foursquare with
  // These indices should be UNIQUE
  while(Object.keys(searchIndices).length !== limit){
    var generateIndex = Math.floor(Math.random() * events.length);
    if(searchIndices.indexOf(generateIndex) === -1){
      searchIndices.push(generateIndex);
    }
  }

  console.log("searchIndices", searchIndices);

  // Create a unique foursquare search object using each of the randomly chosen categoryIds
  // Also push promise functions to array which will run all the foursquare queries
  for(var i = 0; i < searchIndices.length; i++){
    console.log('Search Index: ' + searchIndices[i] + ', Event Category: ' + events[searchIndices[i]]._node.properties.venueCategory);
    var searchObj = {
      ll: '37.78,-122.41',
      categoryId: events[searchIndices[i]]._node.properties.fsCategory,
      intent: 'browse',
      radius: '5000'
    };
    promises.push(exports.venueSearch(searchObj, searchIndices[i], events, ideas));
  }

  // Promise.all is a function which will take in an array and runs all promise functions in the array
  // This allows us to have x number of promises run as though they were chained with .then
  // Now we can run a non-hardcoded number of promises!
  Promise.all(promises)
  .then(function(ideas) {
    // Since we resolve all the promises at once
    // We need to take the result of the promise that is last run since it contains all the ideas
    res.status(200).send(ideas[ideas.length-1]);
  });

};

/** Promise helper function for querying foursquare based on an input searchObj
* Also takes in:
*  the eventIndex and events object to create the random idea string
*  the ideas object which is the master list of all ideas we want to return
*/
exports.venueSearch = function (searchObj, eventIndex, events, ideas) {
  var venuePromise = new Promise(function(resolve, reject) {
    foursquare.venues.search(searchObj, function(err, result) {
      if (err) {
        console.log("There was an error sanitizing the venues!", err);
        reject(err);
      } else {
        var tempVenues = result.response.venues;
        var venues = exports.removeBunkVenues(tempVenues);
        var venueIndex = Math.floor(Math.random() * venues.length);
        var venueId = venues[venueIndex].id;
        exports.getFoursquareImageForVenue(venueId, {})
        .then(function(venueImage) {
          var idea = {idea: events[eventIndex]._node.properties.event + ' at ' + venues[venueIndex].name, liked: 0, disliked: 0, imgUrl: venueImage};
          ideas.ideaArray.push(idea);
          resolve(ideas);
        })
      }
    });
  });
  return venuePromise; 
}

// This function returns venues that have a tipCount of over 10. 
// This increases the chance that the venue will have a bestPhoto to show to the user.
exports.removeBunkVenues = function (venues) {
  var newVenues = [];
  for (var i = 0; i < venues.length; i++) {
    if (venues[i].stats.tipCount > 10) {
      newVenues.push(venues[i]);
    }
  }
  return newVenues;
}

// This function grabs the bestPhoto from the foursquare venue search. If there's no photo, set it to null.
exports.getFoursquareImageForVenue = function (venueId, searchObj) {
  var imagePromise = new Promise(function(resolve, reject) {
    foursquare.venues.venue(venueId, searchObj, function(err, result) {
      if (err) {
        console.log("There was an error getting the foursquare image", err);
        reject(err); 
      } else {
        var venueImage;
        if (result.response.venue.hasOwnProperty('bestPhoto')) {
          venueImage = result.response.venue.bestPhoto.prefix + result.response.venue.bestPhoto.width + 'x' + result.response.venue.bestPhoto.height + result.response.venue.bestPhoto.suffix;
        } else {
          venueImage = null;
        } 
        resolve(venueImage);
      }
    });
  });
  return imagePromise;
}