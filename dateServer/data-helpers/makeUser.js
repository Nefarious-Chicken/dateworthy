var tags = require('./tags');
var events = require('./events');
var util = require('./util');
var users = require('../models/user');
var Promise = require('bluebird');


var myUser = {};
myUser.userName = "Adex Pong";
myUser.tags = {
  indoor: 0,
  crowded: 0,
  culture: 0,
  music: 0,
  sporty: 0,
  geeky: 0
};
users.create(myUser, function(err){
  if(err){
    console.log(err);
    else
      console.log
  }
});





