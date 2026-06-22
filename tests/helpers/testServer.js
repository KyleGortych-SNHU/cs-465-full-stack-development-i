// Builds a minimal Express app that mounts ONLY the API router under /api
// avoids loading app.js & db.js which connect to a real Mongo 
// in-memory connection is owned by dbSetup.js instead.
const express = require('express');
const passport = require('passport');

const passportConfig = require('../../app_api/config/passport');
if (typeof passportConfig === 'function') {
  passportConfig(passport);
}

const apiRouter = require('../../app_api/routes/index');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(passport.initialize());
  app.use('/api', apiRouter);
  return app;
}

module.exports = makeApp;
