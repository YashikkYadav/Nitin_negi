const mongoose = require('mongoose');

// ChatBot interaction model (optional - for logging purposes)
const chatBotInteractionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true
    },
    query: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    },
    model: {
      type: String,
      default: 'gemini-pro-latest'
    }
  },
  {
    timestamps: true,
  }
);

const ChatBotInteraction = mongoose.model('ChatBotInteraction', chatBotInteractionSchema);
module.exports = ChatBotInteraction;