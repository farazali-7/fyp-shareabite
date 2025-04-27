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



import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // connecting post to user
  title: { type: String, required: true },
  description: { type: String },
  foodImages: [{ type: String }],
  location: { type: String },
  foodType: { type: String },
  quantity: { type: Number },
  expirydate: { type: Date },
}, { timestamps: true });


export default mongoose.model('FoodPost', postSchema);
