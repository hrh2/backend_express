const router=require('express').Router()
require('dotenv').config()
const {Message}=require('../Models/messages')
//Token verification function and  Extracting user ID
const {verifyToken,extractUserIdFromToken}=require('../middlewires/tokenVerification')

// POST endpoint to add a new message
router.post('/',verifyToken ,async (req, res) => {
    try {
         const userID = extractUserIdFromToken(req)
        const { replyId, content } = req.body;
        //create a new message
        //the reply id will be sent by the client side  with the id of the message replied  on
        const msg = new Message({
            from: userID,
            content: content,
            replyId: replyId,
        });
        await msg.save();
        //send a response to show that the message has been sent
        res.status(201).json({ message: 'sent',message_was:content});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET endpoint to retrieve all messages
router.get('/',verifyToken, async(req, res) => {
    try {
        //extract the user id from the token
        const userId=extractUserIdFromToken(req)
        //fetch all messages for the user with the extracted id from the token
        const messages = await Message.find({from: userId}||{to:userId});
        //Send the response
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE endpoint to delete a message by its ID
router.delete('/:id',verifyToken, async(req, res) => {
    try {
        //find the message by its ID
        const message = await Message.findByIdAndDelete(req.params.id);
        //if that message is not found
        if (!message) {
            return res.status(404).json({ msg: 'Message  not found' });
        }
        //send the response message
        res.json({ msg: 'Message Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

/*DM me for Editing Endpoints nazo nimba uzikeneye
Kand ubwo nyine mu swagger  iriya endpoint yo kuri messages ya GET BY ID  na  PUT  ntago zikora nyin uzirengagize 2*/


module.exports = router;