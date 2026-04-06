import FoodRequest from '../models/request.js';
import FoodPost from '../models/post.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import mongoose from 'mongoose';

export const createRequest = async (req, res) => {
  try {
    const { postId, requesterId, receiverId } = req.body;
    if (!postId || !requesterId || !receiverId) {
      return res.status(400).json({ message: "Missing postId, requesterId, or receiverId" });
    }

    const post = await FoodPost.findById(postId);
    if (!post || !['active', 'available'].includes(post.status)) {
      return res.status(400).json({ message: 'This food post is no longer available.' });
    }

    const exists = await FoodRequest.findOne({ postId, requesterId });
    if (exists) return res.status(400).json({ message: 'You already requested this post.' });

    const newRequest = await FoodRequest.create({ postId, requesterId, receiverId });

    await Notification.create({
      user: receiverId,
      requester: requesterId,
      post: postId,
      type: 'request',
      title: 'New Food Request',
      description: 'A charity has requested your food post.',
    });

    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: 'Server error while creating request' });
  }
};

// GET /requests/my-post-requests — donor sees all requests on their posts, grouped
export const getMyPostRequests = async (req, res) => {
  try {
    const donorId = req.user._id;

    const posts = await FoodPost.find({
      createdBy: donorId,
      status: { $in: ['active', 'available', 'accepted'] },
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      posts.map(async (post) => {
        const requests = await FoodRequest.find({ postId: post._id })
          .populate('requesterId', 'userName profileImage')
          .sort({ createdAt: -1 });

        const notifs = await Notification.find({ post: post._id, type: 'request' });
        const notifMap = {};
        notifs.forEach(n => { notifMap[n.requester?.toString()] = n._id; });

        return {
          post: {
            _id: post._id,
            foodType: post.foodType,
            quantity: post.quantity,
            quantityUnit: post.quantityUnit,
            area: post.area,
            status: post.status,
            bestBefore: post.bestBefore,
          },
          requests: requests.map(r => ({
            _id: r._id,
            requester: r.requesterId,
            status: r.status,
            createdAt: r.createdAt,
            notificationId: notifMap[r.requesterId?._id?.toString()] || null,
          })),
        };
      })
    );

    res.status(200).json({ posts: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch post requests' });
  }
};

// GET /requests/my-requests — charity sees all their submitted requests
export const getMyRequests = async (req, res) => {
  try {
    const charityId = req.user._id;

    const requests = await FoodRequest.find({ requesterId: charityId })
      .populate({
        path: 'postId',
        select: 'foodType quantity quantityUnit area bestBefore status createdBy',
        populate: { path: 'createdBy', select: 'userName' },
      })
      .sort({ createdAt: -1 });

    const formatted = requests.map(r => ({
      _id: r._id,
      post: r.postId,
      status: r.status,
      createdAt: r.createdAt,
      donorId: r.receiverId,
    }));

    res.status(200).json({ requests: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your requests' });
  }
};

export const getRequestedNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.params.userId })
      .populate({ path: 'requester', select: 'userName profileImage role', model: 'User' })
      .populate({ path: 'post', select: 'foodType quantity createdAt', model: 'FoodPost' })
      .sort({ createdAt: -1 });

    const enrichedNotifications = await Promise.all(
      notifications.map(async (notif) => {
        let requestStatus = 'pending';
        if (notif.post && notif.requester) {
          const request = await FoodRequest.findOne({
            postId: notif.post._id,
            requesterId: notif.requester._id,
          }).select('status');
          if (request) requestStatus = request.status;
        }
        return { ...notif.toObject(), requestStatus };
      })
    );

    res.json(enrichedNotifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
};

// Accept a request — post moves to 'accepted', others auto-rejected
export const acceptRequest = async (req, res) => {
  try {
    const { postId, requesterId, notificationId } = req.body;
    const io = req.app.get('io');

    if (!postId || !requesterId || !notificationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const acceptedRequest = await FoodRequest.findOneAndUpdate(
      { postId, requesterId },
      { status: 'accepted' },
      { new: true }
    );
    if (!acceptedRequest) return res.status(404).json({ error: 'Request not found' });

    // Auto-reject all other requests for this post
    const rejectedRequests = await FoodRequest.find({
      postId,
      requesterId: { $ne: requesterId },
    });

    await FoodRequest.updateMany(
      { postId, requesterId: { $ne: requesterId } },
      { status: 'rejected' }
    );

    await Notification.findByIdAndUpdate(notificationId, { type: 'accepted' });

    // Post moves to 'accepted' — NOT fulfilled yet
    await FoodPost.findByIdAndUpdate(postId, {
      status: 'accepted',
      acceptedBy: requesterId,
    });

    const post = await FoodPost.findById(postId).select('foodType');
    const restaurant = await User.findById(acceptedRequest.receiverId).select('userName');

    // Notify accepted charity
    await Notification.create({
      user: requesterId,
      requester: acceptedRequest.receiverId,
      post: postId,
      title: 'Request Accepted',
      type: 'accepted',
      description: `Your request for ${post?.foodType || 'food'} was accepted by ${restaurant?.userName || 'Donor'}.`,
    });

    io.to(requesterId.toString()).emit('charity_notification', {
      postId,
      type: 'accepted',
      message: `Accepted by ${restaurant?.userName || 'Donor'} for ${post?.foodType}`,
    });

    // Notify auto-rejected charities
    for (const rejected of rejectedRequests) {
      const userId = rejected?.requesterId?.toString();
      if (!userId) continue;

      await Notification.create({
        user: userId,
        requester: acceptedRequest.receiverId,
        post: postId,
        title: 'Request Unavailable',
        type: 'rejected',
        description: `Someone else has been selected for ${post?.foodType || 'this food'}.`,
      });

      io.to(userId).emit('charity_notification', {
        postId,
        type: 'rejected',
        message: `Someone else got there first for ${post?.foodType}`,
      });
    }

    res.status(200).json({ message: 'Request accepted successfully' });
  } catch (err) {
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
    if (!updatedRequest) return res.status(404).json({ error: 'Request not found' });

    await Notification.findByIdAndUpdate(notificationId, { type: 'rejected' });

    const post = await FoodPost.findById(postId).select('foodType');
    const restaurant = await User.findById(updatedRequest.receiverId).select('userName');

    await Notification.create({
      user: requesterId,
      requester: updatedRequest.receiverId,
      post: postId,
      title: 'Request Unavailable',
      type: 'rejected',
      description: `Your request for ${post?.foodType || 'food'} is unavailable.`,
    });

    io.to(requesterId.toString()).emit('charity_notification', {
      postId,
      type: 'rejected',
      message: `Unavailable: ${post?.foodType}`,
    });

    res.status(200).json({ message: 'Request rejected.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCharityNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.params.userId })
      .populate({ path: 'requester', select: 'userName profileImage' })
      .populate({ path: 'post', select: 'foodType quantity createdAt' })
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch charity notifications.' });
  }
};

export const checkExistingRequest = async (req, res) => {
  try {
    const { postId, requesterId } = req.params;
    if (!postId || !requesterId) return res.status(400).json({ message: 'Missing postId or requesterId' });
    const exists = await FoodRequest.findOne({ postId, requesterId });
    res.status(200).json({ exists: !!exists, status: exists?.status || null });
  } catch (err) {
    res.status(500).json({ message: 'Server error while checking request' });
  }
};

export const cancelRequest = async (req, res) => {
  try {
    const { postId, requesterId } = req.body;
    const postObjectId = new mongoose.Types.ObjectId(postId);
    const requesterObjectId = new mongoose.Types.ObjectId(requesterId);

    const deletedRequest = await FoodRequest.findOneAndDelete({
      postId: postObjectId,
      requesterId: requesterObjectId,
    });
    if (!deletedRequest) return res.status(404).json({ message: 'Request not found.' });

    await Notification.findOneAndDelete({
      post: postObjectId,
      requester: requesterObjectId,
      type: 'request',
    });

    res.status(200).json({ message: 'Request cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};
