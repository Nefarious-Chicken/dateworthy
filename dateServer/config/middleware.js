module.exports = function(app, express) {
  var userRouter = express.Router();
  var tagRouter = express.Router();
  var eventRouter = express.Router();
  var venueRouter = express.Router();
  var dateIdeaRouter = express.Router();
  var Router = express.Router();
  var dbTestRouter = express.Router();

  app.use(Router);
  app.use('/users', userRouter);
  app.use('/tags', tagRouter);
  app.use('/events', eventRouter);
  app.use('/venues', venueRouter);
  app.use('/dateIdeas', dateIdeaRouter);
  app.use('/dbCreate', dbTestRouter);

  require('../routers/userRoutes.js')(userRouter);
  require('../routers/tagRoutes.js')(tagRouter);
  require('../routers/eventRoutes.js')(eventRouter);
  require('../routers/routes.js')(Router);
  require('../routers/dateIdeaRoutes.js')(dateIdeaRouter);
  require('../routers/venueRoutes.js')(venueRouter);
  require('../routers/dbTestRoutes.js')(dbTestRouter);

};
