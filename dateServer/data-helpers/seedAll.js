var tags = require('./tags');
var events = require('./events');
var util = require('./util');
var Promise = require('bluebird');


events.seedEventsAsync()
.then(function() {
  return tags.seedTagsAsync()
})
.then(function() {
  util.seedEventTagRelationships('./events.csv')
});

