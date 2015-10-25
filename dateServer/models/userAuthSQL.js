var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize; 

var seqUserAuth = db.tables.userAuth;

module.exports = {

  get: function (userName) {
    seqUserAuth.findOne({ where: {userName: userName} }).then(function(user) {

    })
  },
  post: function (userID, userName, password, res) {
    seqUserAuth.sync().then(function(){

      return seqUserAuth.create({
        userID: userID || "null",
        userName: userName || "null",
        password: password || "null"

      })
    })
  }
}
