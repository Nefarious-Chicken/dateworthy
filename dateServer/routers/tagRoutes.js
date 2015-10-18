var tagController = require('../controllers/tags');

module.exports = function (app) {

  app.post('/', tagController.create);
  app.delete('/:tagname', tagController.del);

}