import mongoose from "mongoose";

const foodPostSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodType: { type: String, required: true },
  quantity: { type: Number, required: true },
  quantityUnit: { type: String, default: 'servings' },
  bestBefore: { type: Date, required: true },
  description: { type: String },
  area: { type: String },
  foodImages: [{ type: String }],
  status: {
    type: String,
    enum: ['active', 'available', 'accepted', 'fulfilled', 'expired', 'cancelled'],
    default: 'active',
  },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  latitude: { type: String },
  longitude: { type: String },
}, { timestamps: true });

export default mongoose.model('FoodPost', foodPostSchema);
