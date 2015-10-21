var tagController = require('../controllers/tags');

module.exports = function (app) {

  //creates and deletes tags in Neo4J

  app.post('/', tagController.create);

  //deletes a tag
  app.delete('/:tagname', tagController.del);

  app.post('/sendTags', tagController.sendTags);

};