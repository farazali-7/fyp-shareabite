import FoodRequest from '../models/request.js';
import FoodPost from '../models/post.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { ForbiddenError } from '../errors/ForbiddenError.js';
import { AppError } from '../errors/AppError.js';

export const createRequest = asyncHandler(async (req, res, next) => {
  const { postId, receiverId } = req.body;
  // requesterId is always derived from the authenticated token — never trusted from body
  const requesterId = req.user._id;

  const post = await FoodPost.findById(postId);
  if (!post || !['active', 'available'].includes(post.status)) {
    return next(new AppError('This food post is no longer available.', 400, 'VALIDATION_ERROR'));
  }

  const exists = await FoodRequest.findOne({ postId, requesterId });
  if (exists) throw new AppError('You have already requested this post.', 409, 'CONFLICT');

  const newRequest = await FoodRequest.create({ postId, requesterId, receiverId });

  await Notification.create({
    user:        receiverId,
    requester:   requesterId,
    post:        postId,
    type:        'request',
    title:       'New Food Request',
    description: 'A charity has requested your food post.',
  });

  res.status(201).json(newRequest);
});

export const getMyPostRequests = asyncHandler(async (req, res) => {
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
      notifs.forEach((n) => { notifMap[n.requester?.toString()] = n._id; });

      return {
        post: {
          _id:         post._id,
          foodType:    post.foodType,
          quantity:    post.quantity,
          quantityUnit: post.quantityUnit,
          area:        post.area,
          status:      post.status,
          bestBefore:  post.bestBefore,
        },
        requests: requests.map((r) => ({
          _id:            r._id,
          requester:      r.requesterId,
          status:         r.status,
          createdAt:      r.createdAt,
          notificationId: notifMap[r.requesterId?._id?.toString()] || null,
        })),
      };
    })
  );

  res.status(200).json({ posts: result });
});

export const getMyRequests = asyncHandler(async (req, res) => {
  const charityId = req.user._id;

  const requests = await FoodRequest.find({ requesterId: charityId })
    .populate({
      path:    'postId',
      select:  'foodType quantity quantityUnit area bestBefore status createdBy',
      populate: { path: 'createdBy', select: 'userName' },
    })
    .sort({ createdAt: -1 });

  const formatted = requests.map((r) => ({
    _id:      r._id,
    post:     r.postId,
    status:   r.status,
    createdAt: r.createdAt,
    donorId:  r.receiverId,
  }));

  res.status(200).json({ requests: formatted });
});

export const getRequestedNotifications = asyncHandler(async (req, res, next) => {
  if (req.params.userId !== req.user._id.toString()) {
    return next(new ForbiddenError('You can only access your own notifications.'));
  }

  const notifications = await Notification.find({ user: req.params.userId })
    .populate({ path: 'requester', select: 'userName profileImage role', model: 'User' })
    .populate({ path: 'post',      select: 'foodType quantity createdAt', model: 'FoodPost' })
    .sort({ createdAt: -1 });

  const enriched = await Promise.all(
    notifications.map(async (notif) => {
      let requestStatus = 'pending';
      if (notif.post && notif.requester) {
        const request = await FoodRequest.findOne({
          postId:     notif.post._id,
          requesterId: notif.requester._id,
        }).select('status');
        if (request) requestStatus = request.status;
      }
      return { ...notif.toObject(), requestStatus };
    })
  );

  res.json(enriched);
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
  const { postId, requesterId, notificationId } = req.body;
  const io = req.app.get('io');

  // SECURITY: verify the authenticated user owns this post before accepting any request
  const post = await FoodPost.findById(postId).select('createdBy foodType status');
  if (!post) return next(new NotFoundError('Post'));
  if (post.createdBy.toString() !== req.user._id.toString()) {
    return next(new ForbiddenError('You can only accept requests on your own posts.'));
  }

  const acceptedRequest = await FoodRequest.findOneAndUpdate(
    { postId, requesterId },
    { status: 'accepted' },
    { new: true }
  );
  if (!acceptedRequest) return next(new NotFoundError('Request'));

  // Auto-reject all other requests for this post
  const rejectedRequests = await FoodRequest.find({ postId, requesterId: { $ne: requesterId } });
  await FoodRequest.updateMany({ postId, requesterId: { $ne: requesterId } }, { status: 'rejected' });

  await Notification.findByIdAndUpdate(notificationId, { type: 'accepted' });
  await FoodPost.findByIdAndUpdate(postId, { status: 'accepted', acceptedBy: requesterId });

  const restaurant = await User.findById(acceptedRequest.receiverId).select('userName');

  await Notification.create({
    user:        requesterId,
    requester:   acceptedRequest.receiverId,
    post:        postId,
    title:       'Request Accepted',
    type:        'accepted',
    description: `Your request for ${post.foodType} was accepted by ${restaurant?.userName || 'Donor'}.`,
  });

  io?.to(requesterId.toString()).emit('charity_notification', {
    postId, type: 'accepted',
    message: `Accepted by ${restaurant?.userName || 'Donor'} for ${post.foodType}`,
  });

  for (const rejected of rejectedRequests) {
    const uid = rejected?.requesterId?.toString();
    if (!uid) continue;

    await Notification.create({
      user:        uid,
      requester:   acceptedRequest.receiverId,
      post:        postId,
      title:       'Request Unavailable',
      type:        'rejected',
      description: `Someone else has been selected for ${post.foodType}.`,
    });

    io?.to(uid).emit('charity_notification', {
      postId, type: 'rejected',
      message: `Someone else got there first for ${post.foodType}`,
    });
  }

  res.status(200).json({ success: true, message: 'Request accepted successfully.' });
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
  const { postId, requesterId, notificationId } = req.body;
  const io = req.app.get('io');

  // SECURITY: verify the authenticated user owns this post before rejecting any request
  const post = await FoodPost.findById(postId).select('createdBy foodType');
  if (!post) return next(new NotFoundError('Post'));
  if (post.createdBy.toString() !== req.user._id.toString()) {
    return next(new ForbiddenError('You can only reject requests on your own posts.'));
  }

  const updatedRequest = await FoodRequest.findOneAndUpdate(
    { postId, requesterId },
    { status: 'rejected' },
    { new: true }
  );
  if (!updatedRequest) return next(new NotFoundError('Request'));

  await Notification.findByIdAndUpdate(notificationId, { type: 'rejected' });

  const restaurant = await User.findById(updatedRequest.receiverId).select('userName');

  await Notification.create({
    user:        requesterId,
    requester:   updatedRequest.receiverId,
    post:        postId,
    title:       'Request Unavailable',
    type:        'rejected',
    description: `Your request for ${post.foodType} is unavailable.`,
  });

  io?.to(requesterId.toString()).emit('charity_notification', {
    postId, type: 'rejected',
    message: `Unavailable: ${post.foodType}`,
  });

  res.status(200).json({ success: true, message: 'Request rejected.' });
});

export const getCharityNotifications = asyncHandler(async (req, res, next) => {
  if (req.params.userId !== req.user._id.toString()) {
    return next(new ForbiddenError('You can only access your own notifications.'));
  }

  const notifications = await Notification.find({ user: req.params.userId })
    .populate({ path: 'requester', select: 'userName profileImage' })
    .populate({ path: 'post',      select: 'foodType quantity createdAt' })
    .sort({ createdAt: -1 });

  res.status(200).json(notifications);
});

export const checkExistingRequest = asyncHandler(async (req, res) => {
  const { postId, requesterId } = req.params;
  const exists = await FoodRequest.findOne({ postId, requesterId });
  res.status(200).json({ exists: !!exists, status: exists?.status || null });
});

export const cancelRequest = asyncHandler(async (req, res, next) => {
  const { postId } = req.body;
  // requesterId is always derived from the authenticated token — never trusted from body
  const requesterId = req.user._id;

  const deletedRequest = await FoodRequest.findOneAndDelete({
    postId: new mongoose.Types.ObjectId(postId),
    requesterId,
  });
  if (!deletedRequest) return next(new NotFoundError('Request'));

  await Notification.findOneAndDelete({
    post:      new mongoose.Types.ObjectId(postId),
    requester: requesterId,
    type:      'request',
  });

  res.status(200).json({ success: true, message: 'Request cancelled successfully.' });
});
