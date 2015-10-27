var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize; 

var seqEvents = db.tables.events;

module.exports = {

  get: function (eventName) {
    // Return the promise in case we want to chain more on to this
    // Added seqEvents.sync() to create the table if it doesn't exist before trying to search
    return seqEvents.sync()
    .then(function(){ 
      return seqEvents.findOne({ where: {eventName: eventName} });
    })
    .then(function(event) {
      return event;
    })
  },
  post: function (eventID, eventName) {
    console.log(eventName)

    // Return the promise in case we want to chain more on to this
    // This way we don't have to pass in res or callback to this function
    return seqEvents.sync()
    .then(function(){
      return seqEvents.findOrCreate({
        where: { eventName: eventName },
        defaults: {
          eventID: eventID,
          eventName: eventName
        }
      });
    });
  }
}