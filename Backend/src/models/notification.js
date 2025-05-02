import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
      },
      post: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FoodPost', 
      }, 
      title: { type: String, required: true },
      description: { type: String },
      type: { type: String },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
