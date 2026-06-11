import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import FoodPost from '../models/post.js';
import FoodRequest from '../models/request.js';
import Notification from '../models/notification.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { ForbiddenError } from '../errors/ForbiddenError.js';
import { AppError } from '../errors/AppError.js';
import { AuthError } from '../errors/AuthError.js';

export const getUserStatusById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select('status');
  if (!user) return next(new NotFoundError('User'));
  res.status(200).json({ status: user.status });
});

export const checkUserExists = asyncHandler(async (req, res) => {
  const { email, contactNumber } = req.body;
  const user = await User.findOne({ $or: [{ email }, { contactNumber }] });
  res.status(200).json({ exists: !!user });
});

export const registerUser = asyncHandler(async (req, res) => {
  const { role, userName, email, contactNumber, password } = req.body;
  const licenseImage = req.file
    ? await uploadToCloudinary(req.file.buffer, 'shareabite/licenses')
    : null;

  const existingUser = await User.findOne({ $or: [{ email }, { contactNumber }] });
  if (existingUser) {
    throw new AppError('An account with this email or phone number already exists.', 409, 'CONFLICT');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await new User({ role, userName, email, contactNumber, password: hashedPassword, licenseImage }).save();

  await new Notification({
    user:  user._id,
    title: 'Welcome to ShareABite!',
    description: 'Your account is under review. We\'ll notify you once approved.',
    type:  'general',
  }).save();

  res.status(201).json({
    success: true,
    message: 'Registration successful. Your account is pending admin approval.',
    user: {
      id:            user._id,
      role:          user.role,
      userName:      user.userName,
      email:         user.email,
      contactNumber: user.contactNumber,
      licenseImage:  user.licenseImage,
    },
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new AuthError('Invalid credentials.', 'INVALID_CREDENTIALS'));
  if (user.role !== role) return next(new AppError('Role does not match.', 400, 'VALIDATION_ERROR'));

  const match = await bcrypt.compare(password, user.password);
  if (!match) return next(new AuthError('Invalid credentials.', 'INVALID_CREDENTIALS'));

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      _id:           user._id,
      userName:      user.userName,
      email:         user.email,
      contactNumber: user.contactNumber,
      role:          user.role,
      profileImage:  user.profileImage,
    },
  });
});

export const contactNumberExits = asyncHandler(async (req, res, next) => {
  const { contactNumber } = req.body;
  const user = await User.findOne({ contactNumber });
  if (!user) return next(new NotFoundError('User'));
  res.status(200).json({ message: 'User exists', userId: user._id, role: user.role });
});

// Step 1 of password reset: called after Firebase OTP verification succeeds.
export const issueResetToken = asyncHandler(async (req, res, next) => {
  const { contactNumber } = req.body;
  const user = await User.findOne({ contactNumber }).select('_id');
  if (!user) return next(new NotFoundError('Account'));

  const resetToken = jwt.sign(
    { userId: user._id, purpose: 'password-reset' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  res.status(200).json({ resetToken });
});

// Step 2 of password reset: requires the short-lived token from issueResetToken.
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken, newPassword } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch {
    return next(new AuthError('Reset link has expired or is invalid. Please start over.', 'TOKEN_EXPIRED'));
  }

  if (decoded.purpose !== 'password-reset') {
    return next(new AuthError('Invalid reset token.', 'TOKEN_INVALID'));
  }

  const user = await User.findById(decoded.userId);
  if (!user) return next(new NotFoundError('User'));

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successfully.' });
});

export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return next(new NotFoundError('User'));
  const posts = await FoodPost.find({ createdBy: user._id }).sort({ createdAt: -1 });
  res.status(200).json({ user, posts });
});

export const searchUsersProfile = asyncHandler(async (req, res) => {
  // req.params.query has been regex-escaped by the validation schema (ReDoS prevention)
  const { query } = req.params;
  const results = await User.find({ userName: { $regex: query, $options: 'i' } })
    .select('_id userName profileImage role');
  res.json(results);
});

export const getProfileAndPosts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').populate('subscribers', '_id');
  const posts = await FoodPost.find({ createdBy: req.params.id });
  res.json({ user, posts });
});

export const toggleSubscribe = asyncHandler(async (req, res, next) => {
  // SECURITY: subscriber identity is always derived from JWT — never from the body.
  const userId = req.user._id;
  const targetUser = await User.findById(req.params.targetId);
  if (!targetUser) return next(new NotFoundError('User'));

  // Use .toString() comparison because subscribers is an ObjectId array
  const isSubscribed = targetUser.subscribers.some((id) => id.toString() === userId.toString());
  if (isSubscribed) {
    targetUser.subscribers = targetUser.subscribers.filter((id) => id.toString() !== userId.toString());
  } else {
    targetUser.subscribers.push(userId);
  }
  await targetUser.save();
  res.json({ success: true, message: 'Subscription updated.' });
});

export const userProfileDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    'userName email contactNumber role profileImage operatingHours cuisineType'
  );
  if (!user) return next(new NotFoundError('User'));
  res.json({ user });
});

export const updateUserProfile = asyncHandler(async (req, res, next) => {
  // SECURITY: profile updates apply only to the authenticated user — never to a URL-provided ID.
  const user = await User.findById(req.user._id);
  if (!user) return next(new NotFoundError('User'));

  const { userName, operatingHours, cuisineType } = req.body;
  if (userName)       user.userName       = userName;
  if (operatingHours) user.operatingHours = operatingHours;
  if (cuisineType && user.role === 'restaurant') user.cuisineType = cuisineType;
  if (req.file) user.profileImage = await uploadToCloudinary(req.file.buffer, 'shareabite/profiles');

  await user.save();
  res.status(200).json({ success: true, message: 'Profile updated', user });
});

export const createPost = asyncHandler(async (req, res) => {
  const { foodType, quantity, quantityUnit, bestBefore, description, area, latitude, longitude } = req.body;
  // SECURITY: post creator is always derived from JWT — never from body fallback.
  const createdBy = req.user._id;

  let foodImages = [];
  if (req.files?.length) {
    foodImages = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, 'shareabite/posts'))
    );
  }

  const post = await new FoodPost({
    foodType,
    quantity:     Number(quantity),
    quantityUnit: quantityUnit || 'servings',
    bestBefore:   new Date(bestBefore),
    description:  description || '',
    area:         area || '',
    createdBy,
    latitude,
    longitude,
    foodImages,
    status: 'active',
  }).save();

  res.status(201).json({ success: true, message: 'Food post created successfully', post });
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const now = new Date();
  const posts = await FoodPost.find({
    status:     { $in: ['active', 'available'] },
    bestBefore: { $gt: now },
  })
    .sort({ bestBefore: 1 })
    .populate('createdBy', '_id userName role profileImage');

  const formatted = posts.map((post) => ({
    _id:          post._id,
    userName:     post.createdBy?.userName || 'Unknown',
    userImage:    post.createdBy?.profileImage || '',
    role:         post.createdBy?.role,
    createdBy:    post.createdBy?._id,
    foodType:     post.foodType,
    quantity:     post.quantity,
    quantityUnit: post.quantityUnit || 'servings',
    area:         post.area || '',
    bestBefore:   post.bestBefore,
    description:  post.description,
    images:       post.foodImages,
    latitude:     post.latitude,
    longitude:    post.longitude,
    status:       post.status,
    createdAt:    post.createdAt,
  }));

  res.status(200).json({ posts: formatted });
});

export const fulfillPost = asyncHandler(async (req, res, next) => {
  const post = await FoodPost.findById(req.params.postId);
  if (!post) return next(new NotFoundError('Post'));
  if (post.createdBy.toString() !== req.user._id.toString()) {
    return next(new ForbiddenError('You can only mark your own posts as fulfilled.'));
  }
  post.status = 'fulfilled';
  await post.save();
  res.status(200).json({ success: true, message: 'Post marked as fulfilled.' });
});

export const cancelPost = asyncHandler(async (req, res, next) => {
  const io = req.app.get('io');
  const post = await FoodPost.findById(req.params.postId);
  if (!post) return next(new NotFoundError('Post'));
  if (post.createdBy.toString() !== req.user._id.toString()) {
    return next(new ForbiddenError('You can only cancel your own posts.'));
  }

  const pendingRequests = await FoodRequest.find({ postId: post._id, status: 'pending' });
  await FoodRequest.updateMany({ postId: post._id, status: { $in: ['pending', 'accepted'] } }, { status: 'rejected' });

  for (const req_ of pendingRequests) {
    io?.to(req_.requesterId.toString()).emit('charity_notification', {
      postId: post._id,
      type:   'cancelled',
      message: 'The food post has been cancelled by the donor.',
    });
  }

  post.status = 'cancelled';
  await post.save();
  res.status(200).json({ success: true, message: 'Post cancelled.' });
});

export const undoAcceptPost = asyncHandler(async (req, res, next) => {
  const post = await FoodPost.findById(req.params.postId);
  if (!post) return next(new NotFoundError('Post'));
  if (post.createdBy.toString() !== req.user._id.toString()) {
    return next(new ForbiddenError('You can only undo acceptance on your own posts.'));
  }
  if (post.status !== 'accepted') {
    throw new AppError('Post is not in an accepted state.', 400, 'VALIDATION_ERROR');
  }

  post.status = 'active';
  post.acceptedBy = null;
  await post.save();
  await FoodRequest.updateMany({ postId: post._id }, { status: 'pending' });

  res.status(200).json({ success: true, message: 'Acceptance undone. Post is active again.' });
});

export const deletePostById = asyncHandler(async (req, res, next) => {
  const post = await FoodPost.findById(req.params.postId);
  if (!post) return next(new NotFoundError('Post'));
  if (post.createdBy.toString() !== req.user._id.toString()) {
    return next(new ForbiddenError('You can only delete your own posts.'));
  }
  await FoodPost.deleteOne({ _id: post._id });
  res.status(200).json({ success: true, message: 'Post deleted successfully.' });
});

export const updatePostById = asyncHandler(async (req, res, next) => {
  const post = await FoodPost.findById(req.params.postId);
  if (!post) return next(new NotFoundError('Post'));
  if (post.createdBy.toString() !== req.user._id.toString()) {
    return next(new ForbiddenError('You can only edit your own posts.'));
  }

  const { foodType, quantity, bestBefore, description, area, quantityUnit } = req.body;
  if (foodType     !== undefined) post.foodType     = foodType;
  if (quantity     !== undefined) post.quantity     = quantity;
  if (bestBefore   !== undefined) post.bestBefore   = bestBefore;
  if (description  !== undefined) post.description  = description;
  if (area         !== undefined) post.area         = area;
  if (quantityUnit !== undefined) post.quantityUnit = quantityUnit;

  const updated = await post.save();
  res.status(200).json(updated);
});
