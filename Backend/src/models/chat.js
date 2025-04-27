import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    resturant: { type: mongoose.type.objectId, required: true }, 
    charity: "",
    created: "",
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;
