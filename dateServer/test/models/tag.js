var expect = require('chai').expect;

var errors = require('../../models/errors');
var User = require('../../models/user');

var Event = require('../../models/event');
var Tag = require('../../models/tag');
var db = require('../../models/db');


// Shared state:

var INITIAL_TAGS;
var TAG_A, TAG_B, TAG_C, TAG_D;


// Helpers:

/**
 * Asserts that the given object is a valid tag model.
 * If an expected tag model is given too (the second argument),
 * asserts that the given object represents the same tag with the same data.
 */
function expectTag(obj, tag) {
    expect(obj).to.be.an('object');
    expect(obj).to.be.an.instanceOf(Tag);

    if (tag) {
        ['tagname'].forEach(function (prop) {
            expect(obj[prop]).to.equal(tag[prop]);
        });
    }
}

/**
 * Asserts that the given array of tags contains the given tag,
 * exactly and only once.
 */
function expectTagsToContain(tags, expTag) {
    var found = false;

    expect(tags).to.be.an('array');
    tags.forEach(function (actTag) {
        if (actTag.tagname === expTag.tagname) {
            expect(found, 'Tag already found').to.equal(false);
            expectTag(actTag, expTag);
            found = true;
        }
    });
    expect(found, 'Tag not found').to.equal(true);
}

/**
 * Asserts that the given array of tags does *not* contain the given tag.
 */
function expectTagsToNotContain(tags, expTag) {
    expect(tags).to.be.an('array');
    tags.forEach(function (actTag) {
        expect(actTag.tagname).to.not.equal(expTag.tagname);
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
 * Asserts that the given error is a ValidationError for the given tagname
 * being taken.
 */
function expectTagnameTakenValidationError(err, tagname) {
    expectValidationError(err, 'The tagname ‘' + tagname + '’ is taken.');
}


// Tests:

describe('Tag models:', function () {

    // Single tag CRUD:

    it('List initial tags', function (next) {
        Tag.getAll(function (err, tags) {
            if (err) return next(err);

            expect(tags).to.be.an('array');
            tags.forEach(function (tag) {
                expectTag(tag);
            });

            INITIAL_TAGS = tags;
            return next();
        });
    });

    it('Create tag A', function (next) {
        var tagname = 'testTagA';
        Tag.create({tagname: tagname}, function (err, tag) {
            if (err) return next(err);

            expectTag(tag);
            expect(tag.tagname).to.equal(tagname);

            TAG_A = tag;
            return next();
        });
    });

    it('Attempt to create tag A again', function (next) {
        Tag.create({tagname: TAG_A.tagname}, function (err, tag) {
            expect(tag).to.not.exist;
            expectTagnameTakenValidationError(err, TAG_A.tagname);
            return next();
        });
    });

    it('Fetch tag A', function (next) {
        Tag.get(TAG_A.tagname, function (err, tag) {
            if (err) return next(err);
            expectTag(tag, TAG_A);
            return next();
        });
    });

    it('List tags again', function (next) {
        Tag.getAll(function (err, tags) {
            if (err) return next(err);

            // The order isn't part of the contract, so we just test that the
            // new array is one longer than the initial, and contains tag A.
            expect(tags).to.be.an('array');
            expect(tags).to.have.length(INITIAL_TAGS.length + 1);
            expectTagsToContain(tags, TAG_A);

            return next();
        });
    });

    it('Update tag A', function (next) {
        TAG_A.patch({
            tagname: TAG_A.tagname + '2',
        }, function (err) {
            return next(err);
        });
    });

    it('Fetch tag A again', function (next) {
        Tag.get(TAG_A.tagname, function (err, tag) {
            if (err) return next(err);
            expectTag(tag, TAG_A);
            return next();
        });
    });

    it('Delete tag A', function (next) {
        TAG_A.del(function (err) {
            return next(err);
        });
    });

    it('Attempt to fetch tag A again', function (next) {
        Tag.get(TAG_A.tagname, function (err, tag) {
            expect(tag).to.not.exist;  // i.e. null or undefined
            expect(err).to.be.an('object');
            expect(err).to.be.an.instanceOf(Error);
            return next();
        });
    });

    it('List tags again', function (next) {
        Tag.getAll(function (err, tags) {
            if (err) return next(err);

            // Like before, we just test that this array is now back to the
            // initial length, and *doesn't* contain tag A.
            expect(tags).to.be.an('array');
            expect(tags).to.have.length(INITIAL_TAGS.length);
            expectTagsToNotContain(tags, TAG_A);

            return next();
        });
    });

    // Two-tag taging:

    it('Create tags B and C', function (next) {
        var tagnameB = 'testTagB';
        var tagnameC = 'testTagC';

        function callback(err, tag) {
            if (err){
                console.log("~~~~~~~~~~~~~Error", err)
                return next(err);  
            } 
            //expectTag(tag);

            switch (tag.tagname || tag.username) {
                case tagnameB:
                    TAG_B = tag;
                    break;
                case tagnameC:
                    TAG_C = tag;
                    break;
                case usernameA:
                    USER_A = tag;
                    break;
                default:
                    // Trigger an assertion error:
                    expect(tag.tagname).to.equal(tagnameB);
            }

            if (TAG_B && TAG_C){//&& USER_A) {
                return next();
            }
        }

        Tag.create({tagname: tagnameB}, callback);
        Tag.create({tagname: tagnameC}, callback);

    });

    it('Attempt to set tag B’s tagname to tag C’s', function (next) {
        TAG_B.patch({tagname: TAG_C.tagname}, function (err) {
            expectTagnameTakenValidationError(err, TAG_C.tagname);

            // Tag B's tagname should not have changed:
            expect(TAG_B.tagname).not.to.equal(TAG_C.tagname);

            return next();
        });
    });


    it('Delete tag B and C', function (next) {
        TAG_C.del(function (err) {
            TAG_B.del(function (err) {
                return next(err);
            });
        });
        
    });

});