const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {verifyToken,extractUserIdFromToken}=require('../middlewires/tokenVerification');
const { User, validateUser } = require('../Models/user');
const { message } = require('./messages');

// Get User Profile
router.get('/',verifyToken, async (req, res) => {
    try {
        //first extract the user id from the token
        const userID=extractUserIdFromToken(req)
        // then find the user with that id
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        //then send the user information
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Update User Profile
router.put('/',verifyToken, async (req, res) => {
    try {
        //first validate the information sent for the user(client) 
        const { error } = validateUser(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        //extract the user information from the request
        const { fullName, phoneNumber,image,email,username,password } = req.body;
        //extract the user id from the request
        const useId = extractUserIdFromToken(req)
        //find the user with that id
        const user = await User.findById(useId);
        //if the user is not found
        if (!user) {
            return res.status(404).json({ message: 'enable to update because u provided wrong username or password' });
        }
        //check if he is authenticated by checking the password
        const validPassword = await bcrypt.compare(password, user.password);
         if (!validPassword) return res.status(401).send({ message:'Invalid  Password' });
        //update the user information  (dm me if u want the APIs to change the password)
        user.fullName=fullName;
        user.phoneNumber=phoneNumber;
        user.image=image;
        user.email=email;
        user.username=username;
        //then save the user updated information
        await user.save()
        //finally send the response with the new user information
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports=router