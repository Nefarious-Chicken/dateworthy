var tagController = require('../controllers/tags');

module.exports = function (app) {

  //creates and deletes tags in Neo4J
  app.post('/', tagController.create);
  app.delete('/:tagname', tagController.del);

};