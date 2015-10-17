var eventController = require('../routes/events');

module.exports = function (app) {

  app.post('/', eventController.create);
  app.delete('/:eventname', eventController.del);

  app.post('/:eventname/tag', eventController.tag);
  app.post('/:eventname/untag', eventController.untag);

}