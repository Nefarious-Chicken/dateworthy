var eventController = require('../controllers/events');

module.exports = function (app) {

  /*----------------SQL-------------*/
  app.post('/createEvent', eventController.createEventSQL);
  app.post('/createVenue', eventController.createVenueSQL);

  /*----------------NEO4J-------------*/

};