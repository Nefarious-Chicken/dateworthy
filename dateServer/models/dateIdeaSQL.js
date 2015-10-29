var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize;

var seqDateIdeas = db.tables.dateIdeas;

module.exports = {

  // Have it return the promise in case we want to chain more to the get
  // Added seqVenues.sync() to create the table if it doesn't exist before trying to search
  get: function (dateIdeaName) {
    return seqDateIdeas.sync()
    .then(function(){
      return seqDateIdeas.findOne({ where: {dateIdeaName: dateIdeaName} });
    })
    .then(function(dateIdea) {
      return dateIdea;
    });
  },
  post: function (dateIdeaName, eventID, venueID, callback) {

    // Can't use findOrCreate method since it will not allow access to setEvent and setVenue methods
    // Use this.get to check if it exists, if not, then create and add foreign keys
    return this.get(dateIdeaName)
    .then(function(dateIdea){
      if(!dateIdea){
        seqDateIdeas.sync().then(function(){
          seqDateIdeas.create({
            dateIdeaName: dateIdeaName
          })
          .then(function(dateIdea){
            dateIdea.setEvent(eventID);
            dateIdea.setVenue(venueID);
            callback(dateIdea);
          });
        });
      } else {
        return dateIdea;
      }
    });
  }
};
