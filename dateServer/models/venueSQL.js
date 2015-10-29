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
  
  post: function (venueID, venueName, venueHours, venueLongitude, venueLatitude, venueAddress, venueCityStateZip) {
    //console.log("Made it to VenueSQL");

    return seqVenues.sync()
    .then(function(){
      return seqVenues.findOrCreate({
        where: { venueName: venueName },
        defaults: {
          venueID: venueID || "null",
          venueName: venueName || "null",
        }
      });
    });
  }
};
