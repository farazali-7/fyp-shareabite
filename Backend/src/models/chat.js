import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastSeen:    { type: Date, default: Date.now },
  unreadCount: { type: Number, default: 0 },
});

const ChatSchema = new mongoose.Schema(
  {
    participants: [participantSchema],
    lastMessage:  { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

// getUserChats and createChat both query: { 'participants.user': userId }
// The old index was on the whole `participants` subdocument which MongoDB
// cannot use for dot-notation queries — replaced with the correct field path.
ChatSchema.index({ 'participants.user': 1 });

const Chat = mongoose.model('Chat', ChatSchema);
export default Chat;
