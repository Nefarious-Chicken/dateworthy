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
  post: function (eventID, eventName, res) {
    console.log(eventName)

    this.get(eventName)
    .then(function(event){
      if(!event){
        console.log('Creating the event in the db');
        seqEvents.sync()
        .then(function(){
          return seqEvents.create({
            eventID: eventID,
            eventName: eventName
          })
        })
        .then(function(newEvent) {
          res.status(201).send(newEvent);
        });
      } else {
        console.log('The event already exists, no need to create it');
        res.status(200).send();
      }
    });
  }
}