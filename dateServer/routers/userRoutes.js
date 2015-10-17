var userController = require('../routes/users');

module.exports = function (app) {

  app.get('/', userController.list);
  app.post('/', userController.create);

  app.get('/:username', userController.show);
  app.post('/:username', userController.edit);
  app.delete('/:username', userController.del);
  
  app.post('/:username/follow', userController.follow);
  app.post('/:username/unfollow', userController.unfollow);
  
  app.post('/:username/tag', userController.tag);
  app.post('/:username/untag', userController.untag);
  
  app.post('/:username/preferences', userController.getAllTags);
  app.post('/bestmatch', userController.getMatchingEvents);

}