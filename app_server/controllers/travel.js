/* GET travel view */
const travel = (req, res) => {
  res.render('travel', {title: 'travlr Getaways'});
};

module.exports = {
  travel
};
