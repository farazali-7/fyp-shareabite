import mongoose from "mongoose";

const foodPostSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodType: { type: String, required: true },
  quantity: { type: Number, required: true },
  bestBefore: { type: Date, required: true },
  description: { type: String, required: true },
  foodImages: [{ type: String }],
  status: { type: String, enum: ['available', 'fulfilled'], default: 'available' },
  latitude: { type: String },
  longitude: { type: String },
}, { timestamps: true });

export default mongoose.model('FoodPost', foodPostSchema);
