const router = require('express').Router();
const { User, validateUser } = require('../Models/user');
const { OTVForEmail } = require('../Models/oneTimeVerificationTokens');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'hotmail', // Change this to your email provider
  secure: false, //
  auth: {
    user: process.env.Email, // Use the email address from your .env file
    pass: process.env.Email_Password, // Use the email password from your .env file
  },
});

router.post('/', async (req, res) => {
  try {
    //validate the info sent from the client
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    //check if the email is used by another user
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    //hash the user password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    //create a new user
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      image: req.body.image,
    });

    //one time verification Token
    const otvToken = uuidv4();

    

    // Saving the token
    const otv =new OTVForEmail({
      username: req.body.username,
      email: req.body.email,
      tokenString: otvToken,
    });
    //create a link the user will click on while verifying the one time verification Token
    const verificationLink = `http:localhost/v1/api/emailVerification/${otvToken}`;
    //create a massage with the link and the token
    const mailOptions = {
      from: process.env.Email,
      to: req.body.email,
      subject: 'Please verify your email',
      html: `<p>Hi ${req.body.fullName},<br />Please click the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a> <br/>The verification Code is : ${otvToken} </p>`,
    };
    //first Send the email
     await transporter.sendMail(mailOptions);
    //then save the token
     await otv.save();
    //and save the new sure
    await user.save();
    //create a token
    const token = jwt.sign(
      { _id: user._id, email: user.email, phone: user.phoneNumber },
      process.env.JWT_SECRET
    );
    //Finally send the response
    res.status(201).json({
      token: token,
      message: 'Please go check your email to verify your email and try logging in',
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
