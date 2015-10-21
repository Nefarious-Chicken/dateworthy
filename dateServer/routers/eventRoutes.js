var eventController = require('../controllers/events');

module.exports = function (app) {

  //creates and deletes events
  app.post('/', eventController.create);
  app.delete('/:eventname', eventController.del);

  //creates relationships or removes relationships between tags and events.
  app.post('/:eventname/tag', eventController.tag);
  app.post('/:eventname/untag', eventController.untag);

};