var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize;

var seqUserAuth = db.tables.userAuth;

module.exports = {

  //gets a user from the userAuth table
  get: function (userName) {
    return seqUserAuth.sync()
    .then(function(){
      return seqUserAuth.findOne({ where: {userName: userName} });
    })
    .then(function(user) {
      return user;
    });

  },

  //adds a user to the userAuth table
  post: function (userID, userName) {
    return seqUserAuth.sync()
    .then(function(){
      return seqUserAuth.findOrCreate({
        where: {
          userName: userName
        },
        defaults: {
          userID: userID,
          userName: userName
        }
      });
    });
  }
};
