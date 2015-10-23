var expect = require('chai').expect;

var errors = require('../../models/errors');
var Event = require('../../models/event');
var Tag = require('../../models/tag');

// Shared state:

var INITIAL_EVENTS;
var EVENT_A, EVENT_B, EVENT_C, EVENT_D;
var TAG_A, TAG_B, TAG_C;


// Helpers:

/**
 * Asserts that the given object is a valid event model.
 * If an expected event model is given too (the second argument),
 * asserts that the given object represents the same event with the same data.
 */
function expectEvent(obj, event) {
    expect(obj).to.be.an('object');
    expect(obj).to.be.an.instanceOf(Event);

    if (event) {
        ['eventname'].forEach(function (prop) {
            expect(obj[prop]).to.equal(event[prop]);
        });
    }
}

function expectTag(obj, event) {
    expect(obj).to.be.an('object');
    expect(obj).to.be.an.instanceOf(Tag);

    if (event) {
        ['eventname'].forEach(function (prop) {
            expect(obj[prop]).to.equal(event[prop]);
        });
    }
}

/**
 * Asserts that the given array of events contains the given event,
 * exactly and only once.
 */
function expectEventsToContain(events, expEvent) {
    var found = false;

    expect(events).to.be.an('array');
    events.forEach(function (actEvent) {
        if (actEvent.eventname === expEvent.eventname) {
            expect(found, 'Event already found').to.equal(false);
            expectEvent(actEvent, expEvent);
            found = true;
        }
    });
    expect(found, 'Event not found').to.equal(true);
}

/**
 * Asserts that the given array of events does *not* contain the given event.
 */
function expectEventsToNotContain(events, expEvent) {
    expect(events).to.be.an('array');
    events.forEach(function (actEvent) {
        expect(actEvent.eventname).to.not.equal(expEvent.eventname);
    });
}

/**
 * Fetches the given event's "tags", and asserts that it
 * reflects the given list of expected tags.
 * Calls the given callback when complete.
 */
function expectEventToTag(event, expTagging, callback) {
    event.getAllTags(function (err, actTagging) {
        if (err) return callback(err);

        expect(actTagging).to.be.an('array');
        expect(actTagging).to.have.length(expTagging.length);


        return callback(null, actTagging);
    });
}

/**
 * Asserts that the given error is a ValidationError with the given message.
 * The given message can also be a regex, to perform a fuzzy match.
 */
function expectValidationError(err, msg) {
    expect(err).to.be.an.instanceOf(Error);
    expect(err).to.be.an.instanceOf(errors.ValidationError);

    if (typeof msg === 'string') {
        expect(err.message).to.equal(msg);
    } else { // regex
        expect(err.message).to.match(msg);
    }
}

/**
 * Asserts that the given error is a ValidationError for the given eventname
 * being taken.
 */
function expectEventnameTakenValidationError(err, eventname) {
    expectValidationError(err, 'The eventname ‘' + eventname + '’ is taken.');
}


// Tests:

describe('Event models:', function () {

    // Single event CRUD:

    it('List initial events', function (next) {
        Event.getAll(function (err, events) {
            if (err) return next(err);

            expect(events).to.be.an('array');
            events.forEach(function (event) {
                expectEvent(event);
            });

            INITIAL_EVENTS = events;
            return next();
        });
    });

    it('Create event A', function (next) {
        var eventname = 'testEventA';
        Event.create({eventname: eventname}, function (err, event) {
            if (err) return next(err);

            expectEvent(event);
            expect(event.eventname).to.equal(eventname);

            EVENT_A = event;
            return next();
        });
    });

    it('Attempt to create event A again', function (next) {
        Event.create({eventname: EVENT_A.eventname}, function (err, _event) {
            expect(_event).to.not.exist;
            //TODO uncomment and fix
            //expectEventnameTakenValidationError(err, EVENT_A.eventname);
            return next();
        });
    });

    it('Fetch event A', function (next) {
        Event.get(EVENT_A.eventname, function (err, event) {
            if (err) return next(err);
            expectEvent(event, EVENT_A);
            return next();
        });
    });

    it('List events again', function (next) {
        Event.getAll(function (err, events) {
            if (err) return next(err);

            // The order isn't part of the contract, so we just test that the
            // new array is one longer than the initial, and contains event A.
            expect(events).to.be.an('array');
            expect(events).to.have.length(INITIAL_EVENTS.length + 1);
            expectEventsToContain(events, EVENT_A);

            return next();
        });
    });

    it('Update event A', function (next) {
        EVENT_A.patch({
            eventname: EVENT_A.eventname + '2',
        }, function (err) {
            return next(err);
        });
    });

    it('Fetch event A again', function (next) {
        Event.get(EVENT_A.eventname, function (err, event) {
            if (err) return next(err);
            expectEvent(event, EVENT_A);
            return next();
        });
    });

    it('Delete event A', function (next) {
        EVENT_A.del(function (err) {
            return next(err);
        });
    });

    it('Attempt to fetch event A again', function (next) {
        Event.get(EVENT_A.eventname, function (err, event) {
            expect(event).to.not.exist;  // i.e. null or undefined
            expect(err).to.be.an('object');
            expect(err).to.be.an.instanceOf(Error);
            return next();
        });
    });

    it('List events again', function (next) {
        Event.getAll(function (err, events) {
            if (err) return next(err);

            // Like before, we just test that this array is now back to the
            // initial length, and *doesn't* contain event A.
            expect(events).to.be.an('array');
            expect(events).to.have.length(INITIAL_EVENTS.length);
            expectEventsToNotContain(events, EVENT_A);

            return next();
        });
    });

    // Two-event tagging:

    it('Create event B and tag A1', function (next) {
        var eventnameB = 'testEventB';
        var tagnameA = 'testTagA1';

        function callback(err, eventOrTag) {
            if (err) return next(err);


            switch (eventOrTag.eventname || eventOrTag.tagname) {
                case eventnameB:
                    EVENT_B = eventOrTag;
                    break;
                case tagnameA:
                    TAG_A = eventOrTag;
                    break;
                default:
                    // Trigger an assertion error:
                    expect(event.eventname).to.equal(eventnameB);
            }

            if (EVENT_B && TAG_A) {
                return next();
            }
        }

        Event.create({eventname: eventnameB}, callback);
        Tag.create({tagname: tagnameA}, callback);
    });

    it('Fetch event B’s “tags”', function (next) {
        expectEventToTag(EVENT_B, [], function (err, tagging, others) {
            if (err) return next(err);

            // Our helper tests everything
            

            return next();
        });
    });

    it('Have event B tag tag A', function (next) {
        EVENT_B.tag(TAG_A, function (err) {
            return next(err);
        });
    });

    it('Have event B tag tag A again', function (next) {
        EVENT_B.tag(TAG_A, function (err) {
            return next(err);
        });
    });

    it('Fetch event B’s “tags”', function (next) {
        expectEventToTag(EVENT_B, [1], next);
    });


    it('Have event B untagg tag A', function (next) {
        EVENT_B.untag(TAG_A, function (err) {
            return next(err);
        });
    });

    // FIXME: Skipping this actually causes the next two tests to fail!
    it('Have event B untagg tag A again', function (next) {
        EVENT_B.untag(TAG_A, function (err) {
            return next(err);
        });
    });

    it('Fetch event A’s “tags”', function (next) {
        expectEventToTag(EVENT_A, [], next);
    });

    it('Fetch event B’s “tags”', function (next) {
        expectEventToTag(EVENT_B, [], next);
    });

    
    // Multi-event-tagging deletions:

    it('Create event D', function (next) {
        var eventname = 'testEventD';
        Event.create({eventname: eventname}, function (err, event) {
            if (err) return next(err);

            expectEvent(event);
            expect(event.eventname).to.be.equal(eventname);

            EVENT_D = event;
            return next();
        });
    });

    it('Attempt to set event B’s eventname to event D’s', function (next) {
        EVENT_B.patch({eventname: EVENT_D.eventname}, function (err) {
            expectEventnameTakenValidationError(err, EVENT_D.eventname);

            // Event B's eventname should not have changed:
            expect(EVENT_B.eventname).not.to.equal(EVENT_D.eventname);

            return next();
        });
    });

    it('Delete event B', function (next) {
        EVENT_B.del(function (err) {
            return next(err);
        });
    });

    it('Delete tag A1', function (next) {
        TAG_A.del(function (err) {
            return next(err);
        });
    });


    it('Delete event D', function (next) {
        EVENT_D.del(function (err) {
            return next(err);
        });
    });

});

