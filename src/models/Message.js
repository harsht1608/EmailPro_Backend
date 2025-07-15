const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  recipientType: String,
  tone: String,
  purpose: String,
  prompt: String,
  response: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', MessageSchema);