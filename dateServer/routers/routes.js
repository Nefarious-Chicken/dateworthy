var userController = require('../controllers/users');

module.exports = function (app) {
  //This will send category data to the server and match events to it.
  app.post('/bestmatch', userController.getMatchingEvents);
};