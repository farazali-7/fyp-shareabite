// controllers/requestController.js
import FoodRequest from '../models/request.js';
import FoodPost from '../models/post.js'
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





export const getRequestedNotifications = async (req, res) => {
  try {

    // Fetch all notifications for the current user (receiver)
    const notifications = await Notification.find({ user: req.params.userId })
      .populate({
        path: 'requester',
        select: 'userName profileImage role',
        model: 'User'
      })
      .populate({
        path: 'post',
        select: 'foodType quantity createdAt',
        model: 'FoodPost'
      })
      .sort({ createdAt: -1 });


    // Add requestStatus for each notification
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notif) => {
        let requestStatus = 'pending';

        if (notif.post && notif.requester) {
          const request = await FoodRequest.findOne({
            postId: notif.post._id,
            requesterId: notif.requester._id
          }).select('status');

          if (request) {
            requestStatus = request.status;
          }
        }

        return {
          ...notif.toObject(),
          requestStatus,
        };
      })
    );

    if (enrichedNotifications.length > 0) {
//
    }

    res.json(enrichedNotifications);

  } catch (err) {
    console.error("\n Error in getRequestedNotifications:", err);
    res.status(500).json({
      message: 'Error fetching notifications',
      error: err.message
    });
  }
};



export const acceptRequest = async (req, res) => {
  try {
    const { postId, requesterId, notificationId } = req.body;
    const io = req.app.get('io');

    console.log(' Accept Request Payload:', { postId, requesterId, notificationId });

    if (!postId || !requesterId || !notificationId) {
      console.error(' Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Accept the current request
    const acceptedRequest = await FoodRequest.findOneAndUpdate(
      { postId, requesterId },
      { status: 'accepted' },
      { new: true }
    );


    if (!acceptedRequest) {
      console.error(' Request not found for update');
      return res.status(404).json({ error: 'Request not found' });
    }

    // 2. Reject all other requests for this post
    const rejectedRequests = await FoodRequest.find({
      postId,
      requesterId: { $ne: requesterId }
    });


    await FoodRequest.updateMany(
      { postId, requesterId: { $ne: requesterId } },
      { status: 'rejected' }
    );

    // 3. Update notification status to 'accepted'
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { type: 'accepted' },
      { new: true }
    );


    // 4. Fulfill the food post
    const updatedPost = await FoodPost.findByIdAndUpdate(postId, { status: 'fulfilled' });
    console.log(' Food post marked as fulfilled:', updatedPost);

    // 5. Get post & restaurant details
    const post = await FoodPost.findById(postId).select('foodType');
    const restaurant = await User.findById(acceptedRequest.receiverId).select('userName');

    console.log(' Post Info:', post);
    console.log(' Restaurant Info:', restaurant);

    // 6. Notify requester (charity)
    const acceptedCharityNotification = await new Notification({
      user: requesterId,
      requester: acceptedRequest.receiverId,
      post: postId,
      title: 'Request Accepted',
      type: 'accepted',
      description: `Your request for ${post?.foodType || 'food'} was  accepted by ${restaurant?.userName || 'Restaurant'}.`,
    }).save();

    console.log(' Created acceptance notification for requester:', acceptedCharityNotification);

    io.to(requesterId.toString()).emit('charity_notification', {
      postId,
      type: 'accepted',
      message: ` Accepted by ${restaurant?.userName || 'Restaurant'} for ${post?.foodType}`,
    });

    // 7. Notify rejected users
    for (const rejected of rejectedRequests) {
      const userId = rejected?.requesterId?.toString();
      if (!userId) {
        console.warn(' Skipping invalid rejected requester:', rejected);
        continue;
      }

      const rejectedNotification = await new Notification({
        user: userId,
        requester: acceptedRequest.receiverId,
        post: postId,
        title: 'Request Rejected',
        type: 'rejected',
        description: `Your request for ${post?.foodType || 'food'} was  rejected by ${restaurant?.userName || 'Restaurant'}.`,
      }).save();

      console.log(` Created rejection notification for user ${userId}:`, rejectedNotification);

      io.to(userId).emit('charity_notification', {
        postId,
        type: 'rejected',
        message: ` Rejected by ${restaurant?.userName || 'Restaurant'} for ${post?.foodType}`,
      });
    }

    res.status(200).json({ message: 'Request accepted successfully' });
  } catch (err) {
    console.error(' Accept request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



export const rejectRequest = async (req, res) => {
  const { postId, requesterId, notificationId } = req.body;
  const io = req.app.get("io");

  try {
    const updatedRequest = await FoodRequest.findOneAndUpdate(
      { postId, requesterId },
      { status: 'rejected' },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update notification
    await Notification.findByIdAndUpdate(notificationId, {
      type: 'rejected',
    });

    // Fetch post & restaurant details
    const post = await FoodPost.findById(postId).select('foodType');
    const restaurant = await User.findById(updatedRequest.receiverId).select('userName');

    // Create charity-side notification
    const charityNotification = await new Notification({
      user: requesterId,
      requester: updatedRequest.receiverId,
      post: postId,
      title: 'Request Rejected',
      type: 'rejected',
      description: `Your request for ${post?.foodType || 'a food item'} was  rejected by ${restaurant?.userName || 'Restaurant'}.`,
    }).save();


    // Emit to charity
    io.to(requesterId.toString()).emit('charity_notification', {
      postId,
      type: 'rejected',
      message: ` Rejected by ${restaurant?.userName || 'Restaurant'} for ${post?.foodType}`,
    });

    res.status(200).json({ message: 'Request rejected.' });
  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};




//charity Notification
export const getCharityNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.params.userId })
      .populate({
        path: 'requester',
        select: 'userName profileImage',
      })
      .populate({
        path: 'post',
        select: 'foodType quantity createdAt',
      })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);

  } catch (err) {
    console.error('Error in getCharityNotifications:', err);
    res.status(500).json({ error: 'Failed to fetch charity notifications.' });
  }
};