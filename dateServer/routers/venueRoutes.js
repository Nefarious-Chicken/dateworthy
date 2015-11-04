var venueController = require('../controllers/venues');
var eventController = require('../controllers/events');

module.exports = function (app) {

  /*----------------SQL-------------*/
  app.post('/createSQL', venueController.createVenueSQL);
  app.get('/venueDetails', eventController.sendFoursquareVenueData);  

  /*----------------NEO4J-------------*/

};