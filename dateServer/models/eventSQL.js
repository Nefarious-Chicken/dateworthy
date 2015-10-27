var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize; 

var seqEvents = db.tables.events;

module.exports = {

  get: function (eventName) {
    seqEvents.findOne({ where: {eventName: eventName} }).then(function(theEvent) {
      return theEvent
    })
  },
  post: function (eventID, eventName, res) {
    console.log(eventName)
    seqEvents.sync().then(function(){
      return seqEvents.create({
        eventID: eventID,
        eventName: eventName
      })
    })
  }
}