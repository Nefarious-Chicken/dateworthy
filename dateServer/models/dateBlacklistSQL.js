var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize; 

var seqDateBlacklist = db.tables.dateBlacklist;

module.exports = {

  // Have it return the promise in case we want to chain more to the get
  // Added seqVenues.sync() to create the table if it doesn't exist before trying to search
  get: function (dateIdeaID) {
    return seqDateBlacklist.sync()
    .then(function(){
      return seqDateBlacklist.findOne({ where: {dateIdeaDateIdeaID: dateIdeaID} })
    })
    .then(function(blacklistIdea) {
      return blacklistIdea;
    })
  },
  post: function (dateIdeaID, eventID, venueID) {
    // Can't use findOrCreate method since it will not allow access to setEvent and setVenue methods
    // Use this.get to check if it exists, if not, then create and add foreign keys
    return seqDateBlacklist.sync()
    .then(function(){
      return seqDateBlacklist.findOne({ where: { dateIdeaDateIdeaID: dateIdeaID }});
    })
    .then(function(dateIdea){
      if(!dateIdea){
        return seqDateBlacklist.sync().then(function(){
          seqDateBlacklist.create()
          .then(function(blacklistIdea){
            blacklistIdea.setDateIdea(dateIdeaID);
          });
        });
      } else {
        return dateIdea;
      }
    });
  }
}