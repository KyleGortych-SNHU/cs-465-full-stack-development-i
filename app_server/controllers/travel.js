//let fs = require('fs');
//let trips = JSON.parse(fs.readFileSync('./data/trips.json', 'utf8'));

const { json } = require("express");

const tripsEndpoint = "http://localhost:3000/api/trips";
const options = {
  method: "GET",
  headers: {
    Accept: "application/json",
  },
};

/* GET travel view */
const travel = async function (req, res, next) {
  // console.log("TRAVEL CONTROLLER BEGIN");
  await fetch(tripsEndpoint, options)
      .then((res) => res.json())
      .then((json) => {
        res.render('travel', {title: 'Travlr Getaways', trips});
      })
      .catch((err) => res.status(500).send(err.message));
};

module.exports = {
  travel,
};
