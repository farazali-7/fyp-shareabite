import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'FoodPost',
      default: null,
    },
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    type: {
      type: String,
      enum: ['request', 'accepted', 'rejected', 'general'],
      default: 'general',
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Both getCharityNotifications and getRequestedNotifications query by user
// and sort by createdAt desc. This is the hottest Notification query pattern.
NotificationSchema.index({ user: 1, createdAt: -1 });

// cancelRequest cleanup: findOneAndDelete({ post, requester, type: 'request' })
NotificationSchema.index({ post: 1, requester: 1, type: 1 });

// TTL: MongoDB auto-deletes notifications older than 90 days.
// 7,776,000 = 90 × 24 × 60 × 60 seconds.
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7_776_000 });

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
