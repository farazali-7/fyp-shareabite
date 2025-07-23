import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  role: { type: String, enum: ['admin', 'restaurant', 'charity'], required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String }, // URL to uploaded image
  licenseImage: { type: String }, 
  profileCompleted: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedByAdmin: { type: Boolean, default: false },
  location: { type: String },
  operatingHours: { type: String }, 
  cuisineType: { type: String }, // Only for restaurants
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  socketId: { 
    type: String,
    default: null 
  },
  onlineStatus: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  pushNotificationToken: {
    type: String,
    default: null
  },
  chatSettings: {
    messageNotifications: {
      type: Boolean,
      default: true
    },
    soundEnabled: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

UserSchema.index({ onlineStatus: 1, lastActive: -1 });

const User = mongoose.model("User", UserSchema);
export default User;
