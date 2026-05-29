// bring in the DB connection and Trip schema
const Mongoose = require('./db')
const Trip = require('./travlr')

// read seed data from json file
let fs = require('fs');
let trips = JSON.parse(fs.readFileSync('./data/trips.json', 'utf8'));

// delete any existing records, then insert seed data
const seedDB = async () => {
  await Trip.deleteMany({});
  await Trip.insertMany(trips);
};

// Close MongoDB connection and exit
seedDB().then(async () => {
  await Mongoose.connection.close();
  process.exit(0);
});
