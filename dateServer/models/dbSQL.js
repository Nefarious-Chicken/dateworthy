
var Sequelize = require('sequelize');

var sequelize = new Sequelize('dateWorthy', 'root', 'password');

module.exports.sequelize = sequelize;

var userAuth = sequelize.define('userAuth', {
  userID: { type: Sequelize.STRING, primaryKey: true, unique: true},
  username: Sequelize.STRING,
  password: Sequelize.STRING
},
{
    timestamps: false
});


var userPrefs = sequelize.define('userPrefs', {
  userID: { type: Sequelize.STRING, primaryKey: true, unique: true},
  likeDislike: Sequelize.BOOLEAN,
},
{
    timestamps: false
});


var dateIdeas = sequelize.define('dateIdeas', {
  dateIdeaID: { type: Sequelize.STRING, primaryKey: true, unique: true},
},
{
    timestamps: false
});

var venues = sequelize.define('venues', {
  venueID: { type: Sequelize.STRING, primaryKey: true, unique: true},
  venueName: Sequelize.STRING,
  venueHours: Sequelize.FLOAT,
  venueLatitude: Sequelize.FLOAT,
  venueLongitude: Sequelize.FLOAT,
  venueAddress: Sequelize.STRING,
  venueFourSquareID: Sequelize.STRING
  
},
{
    timestamps: false
});

var events = sequelize.define('events', {
  EventID: { type: Sequelize.STRING, primaryKey: true, unique: true},
  eventname: Sequelize.STRING,
},
{
    timestamps: false
});

userPrefs.belongsTo(userAuth);
events.belongsTo(dateIdeas);
venues.belongsTo(dateIdeas);
userPrefs.belongsToMany(dateIdeas, {through: 'UserPrefDateIdeas'});
dateIdeas.belongsToMany(userPrefs, {through: 'UserPrefDateIdeas'});

module.exports.tables = {
  userAuth: userAuth,
  userPrefs: userPrefs,
  events: events,
  venues: venues,
  dateIdeas: dateIdeas
}
