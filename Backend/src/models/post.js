import mongoose from "mongoose";

const foodPostSchema = new mongoose.Schema({
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodType:     { type: String, required: true, trim: true },
  quantity:     { type: Number, required: true },
  quantityUnit: { type: String, default: 'servings', trim: true },
  bestBefore:   { type: Date, required: true },
  description:  { type: String, trim: true },
  area:         { type: String, trim: true },
  foodImages:   [{ type: String }],
  status: {
    type: String,
    enum: ['active', 'available', 'accepted', 'fulfilled', 'expired', 'cancelled'],
    default: 'active',
  },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  latitude:   { type: String },
  longitude:  { type: String },
}, { timestamps: true });

// Feed query: getAllPosts filters by status + bestBefore and sorts by bestBefore.
// This is the hottest query in the app — hits on every food feed load.
foodPostSchema.index({ status: 1, bestBefore: 1 });

// Donor profile: getUserProfile fetches all posts by a donor sorted by date.
foodPostSchema.index({ createdBy: 1, createdAt: -1 });

// Donor post management: getMyPostRequests filters by createdBy + status.
foodPostSchema.index({ createdBy: 1, status: 1 });

export default mongoose.model('FoodPost', foodPostSchema);
