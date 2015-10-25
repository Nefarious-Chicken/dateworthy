var dateIdeaController = require('../controllers/dateIdeas');
console.dir(dateIdeaController.createDateIdeaSQL)
module.exports = function (app) {

  /*----------------SQL-------------*/
  app.post('/createSQL', dateIdeaController.createDateIdeaSQL);
  
  /*----------------NEO4J-------------*/

};