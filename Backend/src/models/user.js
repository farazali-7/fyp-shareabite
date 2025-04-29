import mongoose from "mongoose";

const UserSchema  = new mongoose.Schema({
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
},
  { timestamps: true }
);


const User = mongoose.model("User", UserSchema);

export default User;



