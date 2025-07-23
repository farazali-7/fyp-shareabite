import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Number,
    default: 0
  }
});

const ChatSchema = new mongoose.Schema(
  {
    participants: [participantSchema],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Add index for faster querying
ChatSchema.index({ participants: 1, lastMessage: 1 });

const Chat = mongoose.model('Chat', ChatSchema);
export default Chat;