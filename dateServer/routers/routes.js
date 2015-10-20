var routeController = require('../controllers/site');
var userController = require('../controllers/users');

module.exports = function (app) {

  app.get('/', routeController.index);
  app.post('/bestmatch', userController.getMatchingEvents);

}