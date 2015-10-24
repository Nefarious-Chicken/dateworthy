var db = require('./dbSQL');
var Sequelize = require('sequelize');

var dbConnection = db.dbConnection;

var sequelize = db.sequelize; 

var seqUserAuth = db.tables.userAuth;

module.exports = {

  get: function (username) {
    seqUserAuth.findOne({ where: {username: username} }).then(function(user) {
    })
  },
  post: function (username, password, res) {
    seqUserAuth.sync().then(function(){
      return seqUserAuth.findOrCreate({
        username: username,
        password: password
      })
    })
  }
}
