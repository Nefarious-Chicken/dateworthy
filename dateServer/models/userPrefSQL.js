var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize; 

var seqUserPrefs = db.tables.userPrefs;

module.exports = {

  get: function (userName) {
    seqUserPrefs.findOne({ where: {userName: userName} }).then(function(user) {
      
    })
  },
  post: function (userID, likeDislike, res) {
    seqUserPrefs.sync().then(function(){
      seqUserPrefs.create({
        userID: userID,
        likeDislike: likeDislike || "null"
      }).then( function(userPref) {
        userPref.setUserAuth(userID);
      })
      
    })
  }
}