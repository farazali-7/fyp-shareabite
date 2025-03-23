import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    role: { type: String, required: true }, // Eatery or Charity 
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    password: { type: String, required: true },
    licenseImage: { type: String, required: true }, // Storing image path
    profileImage: { type: String },

    // New Fields for Profile Completion & Verification
    profileCompleted: { type: Boolean, default: false }, // Track if profile is fully filled
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }, // Admin verification
    approvedByAdmin: { type: Boolean, default: false }, // Admin approval status
    location: { type: String }, 
    operatingHours: { type: String },
    // Eatery-Specific Fields
    cuisineType: { type: String }, // e.g., Fast Food, Desi, etc. 

  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
