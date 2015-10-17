var routeController = require('../routes/site');

module.exports = function (app) {

  app.get('/', routeController.index);

}