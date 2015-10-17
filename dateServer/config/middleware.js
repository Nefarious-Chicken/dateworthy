module.exports = function(app, express) {
  var userRouter = express.Router();
  var tagRouter = express.Router();
  var eventRouter = express.Router();
  var Router = express.Router();

  app.use('/users', userRouter);
  app.use('/tags', tagRouter);
  app.use('/events', eventRouter);
  app.use('/', Router);

  require('../routers/userRoutes.js')(userRouter);
  require('../routers/tagRoutes.js')(tagRouter);
  require('../routers/eventRoutes.js')(eventRouter);
  require('../routers/routes.js')(Router);

};
