var neo4j = require('neo4j');
var errors = require('./errors');
var db = require('./db');

//Tag model
var Event = module.exports = function Event(_node) {
    this._node = _node;
}

Object.defineProperty(Event.prototype, 'eventname', {
    get: function () { return this._node.properties['eventname']; }
});

// Helper function to check that Event exists
Event.get = function (eventname, callback) {
    var query = [
        'MATCH (event:Event {eventname: {eventname}})',
        'RETURN event',
    ].join('\n')

    var params = {
        eventname: eventname
    };

    db.cypher({
        query: query,
        params: params,
    }, function (err, results) {
        if (err) return callback(err);
        if (!results.length) {
            err = new Error('No such event with eventname: ' + eventname);
            return callback(err);
        }
        var event = new Event(results[0]['event']);
        callback(null, event);
    });
};

Event.create = function (props, callback) {
    var query = [
        'CREATE (event:Event {props})',
        'RETURN event',
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

        var event = new Event(results[0]['event']);
        
        console.log('Event that should have been created');
        console.log(event);

        callback(null, event);
    });
}

Event.prototype.del = function (callback) {
    // Use a Cypher query to delete both this user and his/her following
    // relationships in one query and one network request:
    // (Note that this'll still fail if there are any relationships attached
    // of any other types, which is good because we don't expect any.)
    var query = [
        'MATCH (event:Event {eventname: {eventname}})',
        'OPTIONAL MATCH (event) -[rel:is]- (tag)',
        'DELETE event, rel',
    ].join('\n')

    var params = {
        eventname: this.eventname,
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

Event.prototype.tag = function (tag, callback) {
    var query = [
        'MATCH (event:Event {eventname: {thisEventname}})',
        'MATCH (tag:Tag {tagname: {targetTagname}})',
        'MERGE (event) -[rel:is]-> (tag)',
    ].join('\n')

    var params = {
        thisEventname: this.eventname,
        targetTagname: tag.tagname,
    };

    console.log('Query for tagging:');
    console.log(query);

    console.log('Params for query:');
    console.log(query);

    db.cypher({
        query: query,
        params: params,
    }, function (err) {
        callback(err);
    });
};

Event.prototype.untag = function (tag, callback) {
    var query = [
        'MATCH (event:Event {eventname: {thisEventname}})',
        'MATCH (tag:Tag {tagname: {targetTagname}})',
        'MATCH (event) -[rel:is]-> (tag)',
        'DELETE rel',
    ].join('\n')

    var params = {
        thisEventname: this.eventname,
        targetTagname: tag.tagname,
    };

    db.cypher({
        query: query,
        params: params,
    }, function (err) {
        callback(err);
    });
};