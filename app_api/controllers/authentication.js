const mongoose = require('mongoose');
const User = require('../models/user');
const passport = require('passport');

const register = async(req, res) => {
  if(!req.body.name || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({"message": "All fields required"});
  }

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: ''
  });
  user.setPassword(req.body.password)
  const q = await user.save();

  if(!q) {
    return res
      .status(400)
      .json({"message": "Registration failed"});
  } else {
    const token = user.generateJWT();
    return res
      .status(200)
      .json(token);
  }
};

const login = (req, res) => {
  // validate message to ensure email and password are not empty and meet requirements
  if(!req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({"message": "All fields required"});
  }

  // parse Auth to passport module
  passport.authenticate('local', (err, user, info) => {
    if(err){
      // Error in Auth
      return res
        .status(404)
        .json(err);
    }
    
    // Auth correct then generate JWT and retrun to caller
    if(user) { 
      const token = user.generateJWT();
      res
        .status(200)
        .json({token});
    } else {
      res
        .status(401)
        .json(info);
    }
  }) (req, res);

};

module.exports = {
  register,
  login
};
