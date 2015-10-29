var DateIdeaSQL = require('../models/dateIdeaSQL')

/*--------------------SQL---------------*/

exports.createDateIdeaSQL = function(req, res, next){
  DateIdeaSQL.post(req.body.dateIdeaName, req.body.eventID, req.body.venueID)
  .then(function(idea){
    res.status(201).send(idea);
  });
}