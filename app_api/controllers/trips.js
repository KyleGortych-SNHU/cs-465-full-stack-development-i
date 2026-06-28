/**
 * trips.js
 *
 * Controller for trip API endpoints.
 * Provides request handlers that work with the Trip MongoDB
 * collection via mongoose models and return JSON responses.
 *
 *  Responsibilities:
 *    - fetch trip data from the database
 *    - format HTTP responses
 *    - return the correct HTTP status
 *
 *  Dependencies:
 *    - mongoose
 *    - travlr.js model registration
 *    - express request & response objects
 *
 *  Routes:
 *    - GET  /trips           -> tripsList
 *    - GET  /trips/:tripCode -> tripsFindByCode
 *    - POST /trips           -> tripsAddTrip    (protected)
 *    - PUT  /trips/:tripCode -> tripsUpdateTrip (protected)
 */

const mongoose = require('mongoose');
const Trip = require('../models/travlr'); // registers the model
const Model = mongoose.model('trips');

/**
 * Lists all trips in the database.
 *
 * Postconditions:
 *   - Returns HTTP 200 and a JSON array of trips (possibly empty).
 *   - Returns HTTP 500 on a database/server error.
 *   - Response is sent exactly once.
 *
 * @async
 * @function tripsList
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
const tripsList = async (req, res) => {
  try {
    const q = await Model
      .find({}) // no filter, return all records
      .exec();

    return res
      .status(200)
      .json(q);
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error retrieving trips', error: err.message });
  }
};

/**
 * Returns a single trip matched by its trip code.
 *
 * Postconditions:
 *   - Returns HTTP 200 and a JSON array containing the matching trip.
 *   - Returns HTTP 404 when no trip matches the supplied code.
 *   - Returns HTTP 500 on a database/server error.
 *   - Response is sent exactly once.
 *
 * @async
 * @function tripsFindByCode
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
const tripsFindByCode = async (req, res) => {
  try {
    const q = await Model
      .find({ code: req.params.tripCode })
      .exec();

    if (!q || q.length === 0) {
      return res
        .status(404)
        .json({ message: 'Trip not found' });
    }

    return res
      .status(200)
      .json(q);
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error retrieving trip', error: err.message });
  }
};

/**
 * Creates a new trip from the request body.
 *
 * Postconditions:
 *   - Returns HTTP 201 and the created trip on success.
 *   - Returns HTTP 400 on schema validation failure.
 *   - Returns HTTP 409 when the trip code already exists (duplicate key).
 *   - Returns HTTP 500 on any other database/server error.
 *   - Response is sent exactly once.
 *
 * @async
 * @function tripsAddTrip
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
const tripsAddTrip = async (req, res) => {
  try {
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

    return res
      .status(201)
      .json(q);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res
        .status(400)
        .json({ message: 'Invalid trip data', error: err.message });
    }
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'A trip with that code already exists' });
    }
    return res
      .status(500)
      .json({ message: 'Error creating trip', error: err.message });
  }
};

/**
 * Updates an existing trip matched by its trip code.
 *
 * Postconditions:
 *   - Returns HTTP 200 and the updated trip on success.
 *   - Returns HTTP 404 when no trip matches the supplied code.
 *   - Returns HTTP 400 on schema validation failure.
 *   - Returns HTTP 500 on any other database/server error.
 *   - Response is sent exactly once.
 *
 * @async
 * @function tripsUpdateTrip
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
const tripsUpdateTrip = async (req, res) => {
  try {
    const q = await Model
      .findOneAndUpdate(
        { code: req.params.tripCode },
        {
          code: req.body.code,
          name: req.body.name,
          length: req.body.length,
          start: req.body.start,
          resort: req.body.resort,
          perPerson: req.body.perPerson,
          image: req.body.image,
          description: req.body.description
        },
        { returnDocument: 'after', runValidators: true }
      )
      .exec();

    if (!q) {
      return res
        .status(404)
        .json({ message: 'Trip not found' });
    }

    return res
      .status(200)
      .json(q);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res
        .status(400)
        .json({ message: 'Invalid trip data', error: err.message });
    }
    return res
      .status(500)
      .json({ message: 'Error updating trip', error: err.message });
  }
};

module.exports = {
  tripsList,
  tripsFindByCode,
  tripsAddTrip,
  tripsUpdateTrip
};
