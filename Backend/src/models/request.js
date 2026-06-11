import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  postId:      { type: mongoose.Schema.Types.ObjectId, ref: 'FoodPost', required: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  receiverId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  status:      { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

// Hot path: createRequest (duplicate check), checkExistingRequest, acceptRequest,
// rejectRequest, and cancelRequest all query by { postId, requesterId }.
// unique:true enforces the business rule "one charity can request a post once"
// at the database level, preventing race-condition duplicates.
//
// MIGRATION NOTE: If duplicate { postId, requesterId } documents already exist
// (possible before Stage 1 auth was added), this index creation will fail on
// server startup. Deduplicate first:
//   db.foodrequests.aggregate([
//     { $group: { _id: { postId: "$postId", requesterId: "$requesterId" },
//                 count: { $sum: 1 }, ids: { $push: "$_id" } } },
//     { $match: { count: { $gt: 1 } } }
//   ])
requestSchema.index({ postId: 1, requesterId: 1 }, { unique: true });

// Charity "My Requests" screen: getMyRequests queries by requesterId sorted by date.
requestSchema.index({ requesterId: 1, createdAt: -1 });

export default mongoose.model('FoodRequest', requestSchema);
