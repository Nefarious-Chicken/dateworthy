var DateIdeaSQL = require('../models/dateIdeaSQL')

/*--------------------SQL---------------*/

exports.createDateIdeaSQL = function(req, res, next){
  DateIdeaSQL.post(req.body.dateIdeaID, req.body.eventID, req.body.venueID, res);
}