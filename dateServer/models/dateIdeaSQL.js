var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize; 

var seqDateIdeas = db.tables.dateIdeas;

module.exports = {

  get: function (ideaName) {
    seqDateIdeas.findOne({ where: {ideaName: ideaName} }).then(function(user) {
      
    })
  },
  post: function (dateIdeaID, eventID, venueID, res) {
    seqDateIdeas.sync().then(function(){
      seqDateIdeas.create({
        dateIdeaID: dateIdeaID
      })
      .then(function(dateIdea){
        dateIdea.setEvent(eventID);
        dateIdea.setVenue(venueID);
      })
      .then(function(){
        res.send(200)
      })
    })
  }
}