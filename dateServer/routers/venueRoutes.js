var venueController = require('../controllers/venues');

module.exports = function (app) {

  /*----------------SQL-------------*/
  app.post('/createSQL', venueController.createVenueSQL);
  

  /*----------------NEO4J-------------*/

};