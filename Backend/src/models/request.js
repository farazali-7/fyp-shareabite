import mongoose from 'mongoose';

const foodRequestSchema = new mongoose.Schema({
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodPost: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodPost', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
});

export default mongoose.model('FoodRequest', foodRequestSchema);
