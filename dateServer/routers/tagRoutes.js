var tagController = require('../routes/tags');

module.exports = function (app) {

  app.post('/', tagController.create);
  app.delete('/:tagname', tagController.del);

}