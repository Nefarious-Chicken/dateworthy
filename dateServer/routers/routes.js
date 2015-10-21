var eventController = require('../controllers/events');

module.exports = function (app) {
  
  app.post('/bestmatch', eventController.getMatchingEvents);

}
