var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize; 

var seqVenues = db.tables.venues;

module.exports = {

  get: function (venueName) {
    seqVenues.findOne({ where: {venueName: venueName} }).then(function(venue) {
      return venue
    })
  },
  post: function (venueID, venueName, venueHours, venueLongitude, venueLatitude, venueAddress, res) {
    console.log(venueID)
    seqVenues.sync().then(function(){
      return seqVenues.create({
        venueID: venueID || "null",
        venueName: venueName || "null",
        venueHours: venueHours || "null",
        venueLatitude: venueLatitude || 0,
        venueLongitude: venueLongitude || 0,
        venueAddress: venueAddress || "null"
      })
    })
  }
}
