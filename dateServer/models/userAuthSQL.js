var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize;

var seqUserAuth = db.tables.userAuth;

module.exports = {

  get: function (userName) {
    return seqUserAuth.sync()
    .then(function(){
      return seqUserAuth.findOne({ where: {userName: userName} })
    })
    .then(function(user) {
      return user;
    });

  },

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
