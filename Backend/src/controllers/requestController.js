// controllers/requestController.js
import FoodRequest from '../models/request.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import mongoose from 'mongoose';


export const createRequest = async (req, res) => {
  try {
    const { postId, requesterId, receiverId } = req.body;

 

    if (!postId || !requesterId || !receiverId) {
      return res.status(400).json({ message: "Missing postId, requesterId, or receiverId" });
    }

    // Check if already requested
    const exists = await FoodRequest.findOne({ postId, requesterId });
    if (exists) {
      return res.status(400).json({ message: 'You already requested this post.' });
    }

    // Create new request
    const newRequest = await FoodRequest.create({ postId, requesterId, receiverId });


await Notification.create({
  user: receiverId,             // who will receive the notification
  requester: requesterId,       // who sent it
  post: postId,
  type: 'request',
  title: 'New Food Request',
  description: 'A charity has requested your food post.',
});

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(' Error in createRequest:', err);
    res.status(500).json({ message: 'Server error while creating request' });
  }
};

/*
export const getRequestedNotifications = async (req, res) => {
  console.log("🧪 API hit with userId:", req.params.userId);

  try {
    const notifications = await Notification.find({ user: req.params.userId })
           .populate({
        path: 'requester',
        select: 'userName profileImage role', // These must match UserSchema
        model: 'User' // Explicitly specify the model
      })
      .populate('post', 'foodType quantity createdAt')
         
      .sort({ createdAt: -1 }); 
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};
*/
export const getRequestedNotifications = async (req, res) => {
  console.log("🧪 API hit with userId:", req.params.userId);

  try {
    console.log("1. Starting notification query...");
    const notifications = await Notification.find({ user: req.params.userId })
      .populate({
        path: 'requester',
        select: 'userName profileImage role',
        model: 'User'
      })
      .populate('post', 'foodType quantity createdAt')
      .sort({ createdAt: -1 });

    console.log("\n2. Query completed. Checking results...");
    console.log("   Notifications found:", notifications.length);
    
    if (notifications.length > 0) {
      console.log("\n3. First notification details:");
      const firstNotif = notifications[0].toObject();
      console.log("   - Notification ID:", firstNotif._id);
      console.log("   - Requester field type:", typeof firstNotif.requester);
      
      if (firstNotif.requester) {
        console.log("   - Requester content:", firstNotif.requester);
        console.log("   - Is requester populated?", 
          firstNotif.requester instanceof mongoose.Document ? 'Yes' : 'No');
      } else {
        console.log("   - Requester is null/undefined");
      }

      console.log("\n4. Checking User model reference:");
      console.log("   - Notification schema requester ref:", 
        Notification.schema.path('requester').options.ref);
    }

    console.log("\n5. Verifying User model exists:");
    try {
      const userModel = mongoose.model('User');
      console.log("   - User model found:", !!userModel);
      const testUser = await userModel.findOne().select('userName').lean();
      console.log("   - Test user found:", testUser ? 'Yes' : 'No');
    } catch (err) {
      console.log("   - Error accessing User model:", err.message);
    }

    res.json(notifications);
  } catch (err) {
    console.error("\n❌ Error in getRequestedNotifications:", err);
    res.status(500).json({ 
      message: 'Error fetching notifications',
      error: err.message 
    });
  }
};





