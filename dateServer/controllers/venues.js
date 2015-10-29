var VenueSQL = require('../models/venueSQL');


/*--------------------SQL---------------*/

exports.createVenueSQL = function(req, res, next){
  console.log(req.body.venueID);

  VenueSQL.post(req.body.venueID, req.body.venueName, req.body.venueHours, req.body.venueLongitude, req.body.venueLatitude, req.body.venueAddress)
  .then(function(venue){
    res.status(201).send(venue);
  });
};