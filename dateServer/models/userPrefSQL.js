var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize; 

var seqUserPrefs = db.tables.userPrefs;

module.exports = {

  get: function (userID) {
    return seqUserPrefs.sync()
    .then(function(){
      // Find all the preferences for a single user
      return seqUserPrefs.findAll({ 
        where: {userAuthUserID: userID, likeDislike: 1}, 
        include: [db.tables.dateIdeas] 
      });
    })
    .then(function(userPrefs){
      return userPrefs;
    });
  },

  post: function (userID, dateIdeaID, likeDislike) {
    // Can't use findOrCreate method since it will not allow access to setEvent and setVenue methods
    // Use this.get to check if it exists, if not, then create and add foreign keys
    return seqUserPrefs.sync()
    .then(function(){
      return seqUserPrefs.findOne({ where: {userAuthUserID: userID, dateIdeaID: dateIdeaID }});
    })
    .then(function(userPref){
      // Create the preference if it doesn't exist;
      if(!userPref){
        seqUserPrefs.create({
          // 0 = null, 1 = like, -1 = dislike
          likeDislike: likeDislike || 0
        }).then(function(userPref) {
          userPref.setUserAuth(userID);
          userPref.setDateIdea(dateIdeaID);
          return userPref;
        });
      } else {
        // Update the value of likeDislike if this userID/dateIdeaID combo already exists
        return seqUserPrefs.update({
          likeDislike: likeDislike || 0
        }, { where: {userAuthUserID: userID, dateIdeaID: dateIdeaID }})
        .then(function(userPref){
          return userPref;
        });
      }
    });
  }
}