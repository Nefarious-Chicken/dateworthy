var URL = require('url');

var errors = require('../models/errors');
var Users = require('./users');
var User = require('../models/user');
var Venues = require('./venues');
var Tag = require('../models/tag');
var Event = require('../models/event');
var EventSQL = require('../models/eventSQL');
var VenueSQL = require('../models/venueSQL');
var Promise = require('bluebird');
var config = require('../secret/config');
var dateIdeaSQL = require('../models/dateIdeaSQL');
var userPrefSQL = require('../models/userPrefSQL');
var venueSQL = require('../models/venueSQL');


var clientID = process.env.FS_ID || config.clientID;
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
      res.sendStatus(404);
    }
    res.redirect('/users');

  });
};


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
  console.log("Trying to untag something???");
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

/**
 * given a user attached to an event, returns all tags associated with the user by calling the user model.
 */
var getMyUserTags = function(myUser){
  console.log("Getting the tags for user.");
  return new Promise(function(resolve, reject){
    var myTags = myUser.getAllTags(function(err, tags){
      if(err){
        console.log("there was an error getting the user tags in neo4j");
        reject(err);
      } else {
        if(!tags){
          tags = {};
        }
        //tags.userID = userID();
        resolve(tags);
      }
    });
  });
};


//The rules for defining an event's score are:
//  If the event includes a tag from a questionairre, it gets a point.
//  If the user has liked a tag from the questionairre, it gets points
//   equivalent to the number of times the user has liked that tag.
//  TODO: Weight the user likes.
var defineEventTagScore = function(event, tags, userTags){
  var similarTags = {};
  var eventScore = 0;
  //First we check the event's tags against the tags from the questionairre
  for(var i = 0; i < event.myTags.length; i ++){
    if(tags[event.myTags[i]._node.properties.tagname]){
      similarTags[event.myTags[i]._node.properties.tagname] = 1;
    }
  }
  if(userTags){
    //check the user's likes against the event tags.
    for(i = 0; i < userTags.length; i ++){
      for(j = 0; j < event.myTags.length; j++){
        //console.log(j + " " + event.myTags.length + " " + event.myTags[j]);
        if(event.myTags[j]._node.properties.tagname === userTags[i]._node.properties.tagname){
          if(similarTags[event.myTags[j]._node.properties.tagname]){
            similarTags[event.myTags[j]._node.properties.tagname] += userTags[i].weight;
          } else {
            similarTags[event.myTags[j]._node.properties.tagname] = 1;
          }
        }
      }
    }
  }
  for(var tag in similarTags){
    eventScore += similarTags[tag];
  }
  //console.log("Event Score: ", eventScore);
  event.score = eventScore;
};

/**
 * utility function to sort events based on score.
 */
var compareEventScores = function(eventA, eventB){
  if (eventA.score < eventB.score){
    return -1;
  } else {
    if(eventA.score === eventB.score){
      return 0;
    } else {
      return 1;
    }
  }
};

/**
 * utility function that will create promises to attach tags to events.
 */
var getEventTagPromises = function(events){
  var promises = [];
  //Attach the event tags to the event object.
  for(var i = 0; i < events.length; i ++){
    //console.log("Pushing Promise for event");
    var tagPromise = new Promise(
    function(resolve, reject){
      events[i].getAllTags(function(err, tags){
        if(err){
          reject(err);
        } else {
          resolve(tags);
        }
      });
    });
    promises.push(tagPromise);
  }
  return promises;
};

/**
 * returns the matching events based on a list of tags.
 */
exports.getMatchingEventsNoRest = function(tags, geo, logistics, req, res) {
  console.log("Getting events.");
  var myUser = {
    username: req.body.userName
  };
  var setUser = function(user){
    myUser.id = user._node._id;
    myUser.userObj = user;
  }.bind(this);
  //Get the Neo4J user Object
  console.log("Getting the user.");
  Users.getMyUser(myUser).then(function(user){
    console.log("User retrieved");
    //need to grab the ID
    setUser(user);
    console.log("User: ", user);
    //Get the user's tags.
    return getMyUserTags(user);
  }).then(function(userTags){
    console.log("User Tags Retrieved");
    //take the user tags and attach all of the weights to them.
    var userTagsPromises = [];
    for(var i = 0; i < userTags.length; i ++){
      userTagsPromises.push(myUser.userObj.getTagWeight(userTags[i]));
    }
    Promise.all(userTagsPromises).then(function(userTagWeights){
      //Attach the weights to the tags
      for(var i = 0; i < userTags.length; i ++){
        userTags[i].weight = userTagWeights[i];
      }
      //console.log("User's Tags:", userTags);
      //Get the events that match the questionairre tags
      console.log("Finding events that match tags.");
      var limit = 3;
      var events = [];

      var getEvents = function(events, tags){
        console.log("Searching for matching events: ", tags);
        return Event.getMatchingEvents(tags)
        .then(function(eventsToAdd){
          events = events.concat(eventsToAdd);
          if(events.length >= limit){
            var promises = getEventTagPromises(events);
            Promise.all(promises).then(
              function(theTags){
                console.log("Events length", events.length);
                //Score the tags based on the scoring algorithm.
                for(var i = 0; i < events.length; i ++){
                  defineEventTagScore(events[i], tags, userTags);
                }
                //Sort the events by Score
                events.sort(compareEventScores);
                //Get Venues associated with the top events.
                exports.getFoursquareVenues(events, res, limit, geo, logistics, myUser.id);
              }
            );
          } else {
            var tagKeys = Object.keys(tags);
            console.log("Tag Keys: ", tagKeys);
            var fallbackTags = {};
            // Create a new tag object
            while(Object.keys(fallbackTags).length !== tagKeys.length-1){
              var tagKeyIndex = Math.floor(Math.random() * (tagKeys.length-1));
              console.log("Tag Key Index: ", tagKeyIndex);
              var key = tagKeys[tagKeyIndex];
              fallbackTags[key] = tags[key];
            }
            console.log("Fallback Tags: ", fallbackTags);
            getEvents(events, fallbackTags);
          }
        });
      }
      getEvents([], tags);
    });
  });
};

/**
 * A helper function that, given a set of events that are scored, will select a # of events
 * (with randomization for similarly scored events) and return their indices up to a limit.
 */
var selectVenuesForEvents = function(events, limit){
  var indices = [];
  var j = 0;
  // Randomly select x (limit parameter of this function) number of indices in events input
  // This will choose the categoryId we will query foursquare with
  // These indices should be UNIQUE
  for(var i = 0; i < events.length && indices.length < limit; i ++){
    //Increment i if i is equivalent to J
    if(events[i].score !== events[j].score || i === events.length - 1){
      //if index i is not equal to index J
      if(i-j+indices.length < limit){
        //add every element between j and i if the elements between j and i are less than the limit.
        for(var k =j; k < i; k++){
          indices.push(k);
        }
      }
      else{
        //there are more elements between j and i than we need, so we will select them at random.
        while(indices.length !== limit){
          var generateIndex = Math.floor(Math.random() * (i-j))+j;
          if(indices.indexOf(generateIndex) === -1){
            indices.push(generateIndex);
          }
        }
      }
      //make j equivalent to i once we have added elements to the indices array.
      j = i;
    }
  }
  return indices;
};

/**
 * given a set of events and a limit, define foursquare venues that match these events.
 */

exports.getFoursquareVenues = function(events, res, limit, _geoLocation, _logistics, userID) {
  var ideas = { ideaArray: [] };
  var promises = [];
  var indices = selectVenuesForEvents(events, limit);
  var radius;

  if(_logistics){
    if(_logistics["transportation"] === "I'm walking"){
      radius = 1000;
    } else {
      radius = 5000;
    }
  } else {
    radius = 5000;
  }
  // Create a unique foursquare search object using each of the randomly chosen categoryIds
  // Also push promise functions to array which will run all the foursquare queries
  for(var i = 0; i < indices.length; i++){
    EventSQL.post(events[indices[i]]._node._id, events[indices[i]]._node.properties.event).then(function(event){});
    var searchObj = {
      ll: '37.8044,-122.2708',
      categoryId: events[indices[i]]._node.properties.fsCategory,
      intent: 'browse',
      radius: radius
    };

    if(_geoLocation){
      searchObj.ll = _geoLocation;
    }
    promises.push(exports.venueSearch(searchObj, indices[i], events, ideas, userID));

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
exports.venueSearch = function (searchObj, eventIndex, events, ideas, userID) {
  var venuePromise = new Promise(function(resolve, reject) {
    var foursquareSearch = Promise.promisify(foursquare.venues.search)
    var findVenue = function(searchObj, eventIndex, events){
      return foursquareSearch(searchObj)
      .then(function(result){
        var tempVenues = result.response.venues;
        console.log('The number of venues attached to this event is: ', tempVenues.length);

        // There should always at least be one venue before attempting to debunk
        if(tempVenues.length > 0){
          var venues = exports.removeBunkVenues(tempVenues);
          var venueIndex = Math.floor(Math.random() * venues.length);
          var venueId = venues[venueIndex].id;
          exports.getFourSquareVenueData(venueId, {})
          .then(function(venueData) {
            var idea = {};
            var venueID = venueData.id;
            var venueName = venueData.name;

            venueSQL.post(venueID, venueName)
            .then(function(venue){
              for (var key in venueData) {
                idea[key] = venueData[key];
              }
              if (events[eventIndex]._node.properties.preposition === 'null' || !events[eventIndex]._node.properties.hasOwnProperty('preposition')) {
                idea.idea = events[eventIndex]._node.properties.event + ' ' + venues[venueIndex].name;
              } else {
                idea.idea = events[eventIndex]._node.properties.event + ' ' + events[eventIndex]._node.properties.preposition + ' ' + venues[venueIndex].name;
              }
              idea.liked = 0;
              idea.disliked = 0;
              if (venueData.hasOwnProperty('bestPhoto')) {
                idea.imgUrl = venueData.bestPhoto.prefix + venueData.bestPhoto.width + 'x' + venueData.bestPhoto.height + venueData.bestPhoto.suffix;
              };
              return venue;            
            })
            .then(function(venue){
              return dateIdeaSQL.post(idea.idea, events[eventIndex]._node._id, venueID)
            })
            .then(function(ideaSQL){
              userPrefSQL.post(userID, ideaSQL.id);
              idea.dateIdeaID = ideaSQL.id;
              ideas.ideaArray.push(idea);
              resolve(ideas);
            });
          });
        } else {
          // Get a new index to search according to the same weight scoring
          // Because there were no venues returned for the event category passed initially passed in
          var newIndex = Math.floor(Math.random() * events.length);
          // Alter the category id to be searched in the searchObj (passed into Foursquare)
          searchObj.categoryId = events[newIndex]._node.properties.fsCategory;
          findVenue(searchObj, newIndex, events);
        }
      });
    }
    // Initialize recursive call
    findVenue(searchObj, eventIndex, events); 
  });
  return venuePromise;
};


// This function returns venues that have a checkinsCount of over 30.
// This increases the chance that the venue will have a bestPhoto to show to the user.
exports.removeBunkVenues = function (venues) {
  var newVenues = [];
  for (var i = 0; i < venues.length; i++) {
    if (venues[i].stats.checkinsCount > 30) {
      newVenues.push(venues[i]);
    }
  }
  console.log("Venues left after debunking: ", newVenues.length, "/", venues.length);
  if (newVenues.length !== 0 && newVenues){
    return newVenues;
  } else {
    return [venues[0]];
  }
};

// This function grabs the bestPhoto from the foursquare venue search. If there's no photo, set it to null.
exports.getFourSquareVenueData = function (venueId, searchObj) {
  var venuePromise = new Promise(function(resolve, reject) {
    foursquare.venues.venue(venueId, searchObj, function(err, result) {
      if (err) {
        console.log("There was an error getting the foursquare data", err);
        reject(err);
      } else {
        var venueObj;
        venueObj = result.response.venue;
        resolve(venueObj);
      }
    });
  });
  return venuePromise;
};

/*--------------------SQL---------------*/

exports.createEventSQL = function(req, res, next){
  EventSQL.post(req.body.eventID, req.body.eventName)
  .then(function(event){
    res.status(201).send(event);
  });
};

exports.sendFoursquareVenueData = function(req, res, next){
  exports.getFourSquareVenueData(req.query.venueId, {})
  .then(function(venueData){
    res.status(200).send(venueData);
  })
}

exports.addDateIdeas = function(ideas){};



