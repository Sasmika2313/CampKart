const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [messageSchema],
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' } // To track context of chat
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
