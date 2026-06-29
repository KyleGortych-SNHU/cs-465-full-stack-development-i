let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let handlebars = require('hbs');

let indexRouter = require('./app_server/routes/index');
let usersRouter = require('./app_server/routes/users');
let travelRouter = require('./app_server/routes/travel');
let apiRouter = require('./app_api/routes/index');

// login controller & passport module
let passport = require('passport');
require('./app_api/config/passport');

// connects to DB
require('./app_api/models/db');

// add .env file
require('dotenv').config();

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server/views'));
app.set('view engine', 'hbs');

// register handlebars partials
handlebars.registerPartials(__dirname + '/app_server/views/partials');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize passport module
app.use(passport.initialize());

// enable CORS Cross-Origin Resource Sharing for the Angular SPA
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // Answer the preflight immediately with a 204 to prevent OPTIONS
  // request falling through to the 404 handler which blocks real POST, PUT, and DELETE.
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/travel', travelRouter);
app.use('/api', apiRouter);

// for git action CI testing
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Convert express-jwt auth failures into a 401 JSON response.
// Comes after the routes so it can catch errors thrown. 
// Must forward anything that isn't an auth error to the error handler below.
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res
      .status(401)
      .json({ message: err.name + ': ' + err.message });
  }
  next(err);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
