import mongoose from 'mongoose';

const foodPostSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  foodImages: [{ type: String }], // Multiple image URLs
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  location: { type: String, required: true },
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodRequest' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('FoodPost', foodPostSchema);
