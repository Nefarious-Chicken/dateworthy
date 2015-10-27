var eventController = require('../controllers/events');
var dateController = require('../controllers/dateIdeas')

module.exports = function (app) {

  /*----------------SQL-------------*/
  app.post('/createEvent', eventController.createEventSQL);
  app.post('/createVenue', eventController.createVenueSQL);
  app.post('/createDateIdea', dateController.createDateIdeaSQL);

  /*----------------NEO4J-------------*/

};