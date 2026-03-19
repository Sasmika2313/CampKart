const express = require('express');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET all user conversations
router.get('/', protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: { $in: [req.user._id] }
        })
        .populate('participants', 'name email')
        .populate('productId', 'title price imageUrl')
        .sort({ updatedAt: -1 });
        
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching conversations', error: err.message });
    }
});

// POST to start or update a conversation
router.post('/', protect, async (req, res) => {
    const { receiverId, productId, message } = req.body;
    
    try {
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, receiverId] },
            productId
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [req.user._id, receiverId],
                productId,
                messages: []
            });
        }

        conversation.messages.push({
            sender: req.user._id,
            content: message
        });

        await conversation.save();
        res.status(201).json(conversation);
    } catch (err) {
        res.status(500).json({ message: 'Error sending message', error: err.message });
    }
});

module.exports = router;
