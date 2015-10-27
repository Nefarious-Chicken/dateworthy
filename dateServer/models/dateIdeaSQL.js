var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize; 

var seqDateIdeas = db.tables.dateIdeas;

module.exports = {

  // Have it return the promise in case we want to chain more to the get
  // Added seqVenues.sync() to create the table if it doesn't exist before trying to search
  get: function (dateIdeaID) {
    return seqDateIdeas.sync()
    .then(function(){
      console.log("Here before find");
      return seqDateIdeas.findOne({ where: {dateIdeaID: dateIdeaID} })
    })
    .then(function(dateIdea) {
      return dateIdea;
    })
  },
  post: function (dateIdeaID, eventID, venueID) {

    // Can't use findOrCreate method since it will not allow access to setEvent and setVenue methods
    // Use this.get to check if it exists, if not, then create and add foreign keys
    return this.get(dateIdeaID)
    .then(function(dateIdea){
      if(!dateIdea){
        seqDateIdeas.sync().then(function(){
          seqDateIdeas.create({
            dateIdeaID: dateIdeaID
          })
          .then(function(dateIdea){
            dateIdea.setEvent(eventID);
            dateIdea.setVenue(venueID);
          });
        });
      } else {
        return dateIdea;
      }
    });
  }
}