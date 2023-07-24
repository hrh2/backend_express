require('dotenv').config();
const router = require('express').Router();
const { User, validateOnLogin } = require('../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
require('dotenv').config();



router.post('/', async (req, res) => {
   try {
      //First validate the received  information
      const { error } = validateOnLogin(req.body);
      if (error) return res.status(400).send({ message: error.details[0].message });
      //Find the user with the email received from the client
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(401).send({ message: 'Invalid Email or Password' });
      //Check if his email is verified
      if (user.IsEmailVerified==false) return res.status(400).send({ message: 'Fast go verify your email' });
      //then check also the password
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) return res.status(401).send({ message: 'Invalid Email or Password' });
      //create a token for the user
      const token = jwt.sign({ _id: user._id,email:user.email},process.env.JWT_SECRET);
      //Send the response with a token
      res.status(200).send({ token:token,message: 'successful login'});
   } catch (err) {
      res.status(500).send({ message: err.message });
   }
});

module.exports = router;
