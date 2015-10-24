var userController = require('../controllers/users');

module.exports = function (app) {

  //gets all users, and creates a user
  app.get('/', userController.list);
  app.post('/', userController.create);

  //retrieves a specific user
  app.get('/:username', userController.show);
  app.post('/:username', userController.edit);
  app.delete('/:username', userController.del);

  app.post('/:username/follow', userController.follow);
  app.post('/:username/unfollow', userController.unfollow);

  //establishes a relationships between a tag and a user
  app.post('/:username/tag', userController.tag);
  app.post('/:username/untag', userController.untag);

  //returns all tags associated with a user.
  app.post('/:username/preferences', userController.getAllTags);

  //retrieves and modifies weights on relationships
  app.post('/:username/increaseWeight', userController.increaseWeight);
  app.post('/:username/decreaseWeight', userController.decreaseWeight);
};