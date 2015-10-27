var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize; 

var seqVenues = db.tables.venues;

module.exports = {

  // Have it return the promise in case we want to chain more to the get
  // Added seqVenues.sync() to create the table if it doesn't exist before trying to search
  get: function (venueName) {
    return seqVenues.sync()
    .then(function(){
      return seqVenues.findOne({ where: {venueName: venueName} });
    })
    .then(function(venue) {
      return venue;
    })
  },
  post: function (venueID, venueName, venueHours, venueLongitude, venueLatitude, venueAddress, res) {
    console.log(venueID)

    // Check if the event already exists
    this.get(venueName)
    .then(function(venue){
      if(!venue){
        console.log('Creating the venue in the db');
        seqVenues.sync()
        .then(function(){
          return seqVenues.create({
            venueID: venueID || "null",
            venueName: venueName || "null",
            venueHours: venueHours || "null",
            venueLatitude: venueLatitude || 0,
            venueLongitude: venueLongitude || 0,
            venueAddress: venueAddress || "null"
          })
        })
        .then(function(newVenue){
          res.status(201).send(newVenue);
        });
      } else {
        console.log('Venue already exists in the db, no need to create it');
        res.status(200).send();
      } 
    });
  }
}
