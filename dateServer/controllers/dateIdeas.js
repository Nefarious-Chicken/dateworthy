var DateIdeaSQL = require('../models/dateIdeaSQL')

/*--------------------SQL---------------*/

exports.createDateIdeaSQL = function(req, res, next){
  DateIdeaSQL.post(req.body.dateIdeaID, req.body.eventID, req.body.venueID, function(err, user){
    if(err) return next(err);
    res.send(user);
  })
}