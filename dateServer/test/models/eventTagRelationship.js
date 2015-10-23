var expect = require('chai').expect;

var errors = require('../../models/errors');
var Event = require('../../models/event');
var Tag = require('../../models/tag');

// Shared state:

var INITIAL_EVENTS;
var EVENT_A, EVENT_B, EVENT_C, EVENT_D;
var TAG_A, TAG_B, TAG_C;

describe('Event recommendations with tag inputs:', function () {
  var eventA = {eventname: 'eventTestA'};
  var eventB = {eventname: 'eventTestB'};
  var eventC = {eventname: 'eventTestC'};

  var tagA = {tagname: 'eventTagA'};
  var tagB = {tagname: 'eventTagB'};
  var tagC = {tagname: 'eventTagC'};

  beforeEach(function (done) {
    Event.create(eventA, function (err, event) {
      EVENT_A = event;
      Event.create(eventB, function (err, event) {
        EVENT_B = event;
        Event.create(eventC, function (err, event) {
          EVENT_C = event;
          Tag.create(tagA, function (err, tag) {
            TAG_A = tag;
            Tag.create(tagB, function (err, tag) {
              TAG_B = tag;
              Tag.create(tagC, function (err, tag) {
                TAG_C = tag;
                EVENT_A.tag(TAG_A, function (err) {
                  EVENT_A.tag(TAG_B, function (err) {
                    EVENT_B.tag(TAG_A, function (err) {
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  afterEach(function (done) {
    EVENT_A.del(function (err) {
      EVENT_B.del(function (err) {
        EVENT_C.del(function (err) {
          TAG_A.del(function (err) {
            TAG_B.del(function (err) {
              TAG_C.del(function (err) {
                done();
              });
            });
          });            
        });
      });
    });
  });

  it('Gets events based on input profile with one tag to match', function (next) {
    var tagsFromClient = {};
    tagsFromClient[tagA.tagname] = 1;

    Event.getMatchingEvents(tagsFromClient, function (err, matches) {
      expect(matches).to.be.an('array');
      expect(matches).to.have.length(2);
      return next();
    });
  });

  it('Gets events based on input profile with more than one tag to match', function (next) {
    var tagsFromClient = {};
    tagsFromClient[tagA.tagname] = 1;
    tagsFromClient[tagB.tagname] = 1;

    Event.getMatchingEvents(tagsFromClient, function (err, matches) {
      expect(matches).to.be.an('array');
      expect(matches).to.have.length(1);
      expect(matches[0]._node.properties.eventname).to.equal(eventA.eventname);
      return next();
    });
  });

  it('Only gets events that match all tags in the input profile', function (next) {
    var tagsFromClient = {};
    tagsFromClient[tagA.tagname] = 1;
    tagsFromClient[tagC.tagname] = 1;

    Event.getMatchingEvents(tagsFromClient, function (err, matches) {
      expect(matches).to.be.an('array');
      expect(matches).to.have.length(0);
      return next();
    });
  });

  it('Gets events that both match input profile and have additional tags', function (next) {
    var tagsFromClient = {};
    tagsFromClient[tagB.tagname] = 1;

    Event.getMatchingEvents(tagsFromClient, function (err, matches) {
      expect(matches).to.be.an('array');
      expect(matches).to.have.length(1);
      expect(matches[0]._node.properties.eventname).to.equal(eventA.eventname);
      return next();
    });
  });
});
