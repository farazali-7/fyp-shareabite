// models/notificationModel.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Notification recipient
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // sender
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodPost",
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["request", "accepted", "rejected", "general"], //  added "rejected"
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
