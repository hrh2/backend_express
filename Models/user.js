const mongoose = require('mongoose');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: false },
  fullName: { type: String ,required: true},
  phoneNumber: { type: String,required: true, unique: true},
  IsEmailVerified:{ type: Boolean, default: false}
  // Additional properties can be added as per your requirements
});

const User = mongoose.model('User', userSchema);

// Validation function
const validateUser = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().label('Username'),
    email: Joi.string().email().required().label('Email'),
    password: passwordComplexity().required().label('Password'),
    fullName: Joi.string().label('Full Name'),
    phoneNumber: Joi.string().label('Phone Number'),
    image:Joi.string().label('Image'),
    // others props u want to verify
  });

  return schema.validate(data);
};

const validateOnLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().required().label('Password'),
  });
  return schema.validate(data);
};
module.exports = {
  User,
  validateUser,
  validateOnLogin
};
