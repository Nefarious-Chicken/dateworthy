var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize;

var seqUserAuth = db.tables.userAuth;

module.exports = {

  get: function (userName) {
    seqUserAuth.findOne({ where: {userName: userName} }).then(function(user) {

    });
  },
  post: function (userID, userName, res) {
    seqUserAuth.sync().then(function(){
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
