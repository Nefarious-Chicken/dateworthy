var sequelize;
var Sequelize = require('sequelize');

if (process.env.CLEARDB_DATABASE_URL) {
    // the application is executed on Heroku ... use the postgres database
    sequelize = new Sequelize(process.env.CLEARDB_DATABASE_URL, {
  
    })
  } else {
    // the application is executed on the local machine ... use mysql
    sequelize = new Sequelize('dateWorthy', 'root', '', { logging: false });
  }


module.exports.sequelize = sequelize;

var userAuth = sequelize.define('userAuth', {
  userID: { type: Sequelize.STRING, primaryKey: true, unique: true},
  userName: Sequelize.STRING
},
{
    timestamps: false
});

var userPrefs = sequelize.define('userPrefs', {
  // userID: { type: Sequelize.STRING, primaryKey: true, unique: true},
  likeDislike: Sequelize.INTEGER,
},
{
    timestamps: false
});

var dateIdeas = sequelize.define('dateIdeas', {
  dateIdeaName: Sequelize.STRING
},
{
    timestamps: false
});

var dateBlacklist = sequelize.define('dateBlacklist', {
  blacklistID: { type: Sequelize.INTEGER, primaryKey: true, unique: true, autoIncrement: true }, 
  approved: { type: Sequelize.INTEGER },
},
{
  timestamps: false
})

var venues = sequelize.define('venues', {
  venueID: { type: Sequelize.STRING, primaryKey: true, unique: true},
  venueName: Sequelize.STRING,
  venueHours: Sequelize.STRING,
  venueLatitude: Sequelize.FLOAT,
  venueLongitude: Sequelize.FLOAT,
  venueAddress: Sequelize.STRING,
  venueCityStateZip: Sequelize.STRING
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
userPrefs.belongsTo(dateIdeas);
dateBlacklist.belongsTo(dateIdeas);
dateIdeas.belongsTo(events);
dateIdeas.belongsTo(venues);
userPrefs.belongsToMany(dateIdeas, {through: 'UserPrefDateIdeas'});
dateIdeas.belongsToMany(userPrefs, {through: 'UserPrefDateIdeas'});

module.exports.tables = {
  userAuth: userAuth,
  userPrefs: userPrefs,
  events: events,
  venues: venues,
  dateIdeas: dateIdeas,
  dateBlacklist: dateBlacklist
};
