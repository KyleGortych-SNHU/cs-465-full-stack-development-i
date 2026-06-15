/**
 * trips.js
 *
 * Controller for trip API endpoints.
 * Provides request handlers that work with the Trip MongoDB
 * collection via mongoose models and return JSON responses.
 *
 *  Responsibilities:
 *    - fetches trip data from database
 *    - format HTTP responses
 *    - return correct HTTP status
 *
 *  Dependencies:
 *    - mongoose
 *    - travlr.js model registration
 *    - express request & response objects
 *
 *  Routes:
 *    - GET /trips
 *
 */


const mongoose = require('mongoose');
const Trip = require('../models/travlr'); // the register model
const Model = mongoose.model('trips');

/**
 * Lists all trips in the database.
 *
 * Preconditions:
 *   - req and res are valid Express request/response objects.
 *   - MongoDB connection has been established.
 *   - The "trips" model is registered with Mongoose.
 *
 * Postconditions:
 *   - Returns HTTP 200 and a JSON array of trips when records exist.
 *   - Returns HTTP 404 if no trip data is found.
 *   - Response is sent exactly once.
 *
 * Exceptions:
 *   - TODO: Implement try/catch handling for database and 
 *     server errors and return HTTP 500 response.
 *
 * Side Effects:
 *   - Executes a database query against the trips collection.
 *
 * @async
 * @function tripsList
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
// TODO: Add try/catch and return HTTP 500 for databased errors.
const tripsList = async(req, res) => {
  const q = await Model
    .find({}) // no filter, return all records
    .exec();

  // uncomment to see results of querey
  // on the console
  // console.log(q);
  
  // if database returns no data
  // TODO: apply || q.length === 0 as .find({}) returns not null but empty array
  if(!q) {
    return res
        .status(404)
        // TODO: replace with better error ahndling
        // switch to .json({message: 'No trips found'})
        .json(err); 
  } else {
    return res
        .status(200)
        .json(q);
  }
};

/**
 * Similar to tripsList but, uses filter to,
 * GET /trip/:tripCode lists single trip 
 *
 * Preconditions:
 *   - req and res are valid Express request/response objects.
 *   - MongoDB connection has been established.
 *   - The "trips" model is registered with Mongoose.
 *
 * Postconditions:
 *   - Returns HTTP 200 and a JSON array of trips when records exist.
 *   - Returns HTTP 404 if no trip data is found.
 *   - Response is sent exactly once.
 *
 * Exceptions:
 *   - TODO: Implement try/catch handling for database and 
 *     server errors and return HTTP 500 response.
 *
 * Side Effects:
 *   - Executes a database query against the trips collection.
 *
 * @async
 * @function tripsList
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
const tripsFindByCode = async(req, res) => {
  const q = await Model
    .find({'code' : req.params.tripCode })
    .exec();

  // uncomment to see results of querey
  // on the console
  // console.log(q);
  
  // if database returns no data
  // TODO: apply || q.length === 0 as .find({}) returns not null but empty array
  if(!q) {
    return res
        .status(404)
        // TODO: replace with better error ahndling
        // switch to .json({message: 'No trips found'})
        .json(err); 
  } else {
    return res
        .status(200)
        .json(q);
  }
};

const tripsAddTrip = async(req, res) => {
  const newTrip = new Trip({
    code: req.body.code,
    name: req.body.name,
    length: req.body.length,
    start: req.body.start,
    resort: req.body.resort,
    perPerson: req.body.perPerson,
    image: req.body.image,
    description: req.body.description
  });

  const q = await newTrip.save();

  if(!q){
    return res
      .status(400)
      .json(err)
  } else {
    return res
      .status(201)
      .json(q)
  }

  // test for results
  // console.log(q);
}

// PUT: /trips/:tripCode - Adds a new Trip
// Regardless of outcome, response must include HTML status
// code
// and JSON message to the requesting client
const tripsUpdateTrip = async(req, res) => {
  // Uncomment for debugging
  //console.log(req.params);
  //console.log(req.body);
  const q = await Model
  .findOneAndUpdate(
    { 'code' : req.params.tripCode },
    {
      code: req.body.code,
      name: req.body.name,
      length: req.body.length,
      start: req.body.start,
      resort: req.body.resort,
      perPerson: req.body.perPerson,
      image: req.body.image,
      description: req.body.description
    })
  .exec();

  if(!q) { // Database returned no data
  return res
  .status(400)
  .json(err);
  } else { // Return resulting updated trip
    return res
    .status(201)
    .json(q);
  }
  // console.log(q);
};

module.exports = {
  tripsList,
  tripsFindByCode,
  tripsAddTrip,
  tripsUpdateTrip
};
