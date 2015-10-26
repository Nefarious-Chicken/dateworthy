
var Sequelize = require('sequelize');

var sequelize = new Sequelize('dateWorthy', 'root', '');

module.exports.sequelize = sequelize;

var userAuth = sequelize.define('userAuth', {
  userID: { type: Sequelize.STRING, primaryKey: true, unique: true},
  userName: Sequelize.STRING
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
  venueHours: Sequelize.STRING,
  venueLatitude: Sequelize.FLOAT,
  venueLongitude: Sequelize.FLOAT,
  venueAddress: Sequelize.STRING
  
},
{
    timestamps: false
});

var events = sequelize.define('events', {
  eventID: { type: Sequelize.STRING, primaryKey: true, unique: true},
  eventName: Sequelize.STRING,
},
{
    timestamps: false
});

userPrefs.belongsTo(userAuth);
dateIdeas.belongsTo(events);
dateIdeas.belongsTo(venues);
userPrefs.belongsToMany(dateIdeas, {through: 'UserPrefDateIdeas'});
dateIdeas.belongsToMany(userPrefs, {through: 'UserPrefDateIdeas'});

module.exports.tables = {
  userAuth: userAuth,
  userPrefs: userPrefs,
  events: events,
  venues: venues,
  dateIdeas: dateIdeas
};
