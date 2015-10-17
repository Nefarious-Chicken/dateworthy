var neo4j = require('neo4j');
var errors = require('./errors');
var db = require('./db');

/**
 * Tag Model
 */
var Tag = module.exports = function Tag(_node) {
    this._node = _node;
}

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


    console.log('Checking if db exists');
    console.log(db);


    console.log('Params for query are: ');
    console.log(params);
    console.log('Constructed query is: ' + query);

    db.cypher({
        query: query,
        params: params,
    }, function (err, results) {
        if (err) return callback(err);
        console.log('Results are:');
        console.log(results);

        var tag = new Tag(results[0]['tag']);
        
        console.log('Tag that should have been created');
        console.log(tag);

        callback(null, tag);
    });
}

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

    console.log('Param to pass into query:');
    console.log(params);

    console.log('Constructed Query:');
    console.log(query);

    db.cypher({
        query: query,
        params: params,
    }, function (err) {
        callback(err);
    });
};
