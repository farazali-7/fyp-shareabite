import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    chatID: { type: mongoose.type.objectId, required: true }, 
    message: "",
    user: "",
    user_type: SENDER, RECEIVER,
    created_date
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;
