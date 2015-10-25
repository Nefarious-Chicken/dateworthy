var VenueSQL = require('../models/venueSQL')

/*--------------------SQL---------------*/

exports.createVenueSQL = function(req, res, next){
  VenueSQL.post(req.body.venueID, req.body.venueName, req.body.venueHours, req.body.venueLongitude, req.body.venueLatitude, req.body.venueAddress, function(err, venue){
    if(err) return next(err);
    res.send(venue);
  })
}

