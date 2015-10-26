var eventController = require('../controllers/events');

//returns the matching events based on tags submitted by the user.
module.exports = function (app) {
  app.post('/bestmatch', eventController.getMatchingEvents);

};
