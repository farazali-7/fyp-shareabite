import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import FoodPost from '../models/post.js';
import FoodRequest from '../models/request.js';
import Notification from '../models/notification.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

export const getUserStatusById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select('status');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ status: user.status });
  } catch (err) {
    return res.status(500).json({ message: 'Server error while fetching user status' });
  }
};

export const checkUserExists = async (req, res) => {
  try {
    const { email, contactNumber } = req.body;
    const user = await User.findOne({ $or: [{ email }, { contactNumber }] });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { role, userName, email, contactNumber, password } = req.body;
    const licenseImage = req.file
      ? await uploadToCloudinary(req.file.buffer, 'shareabite/licenses')
      : req.body.licenseImage || null;

    if (!role || !userName || !email || !contactNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { contactNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ role, userName, email, contactNumber, password: hashedPassword, licenseImage });
    const user = await newUser.save();

    const notification = new Notification({
      user: user._id,
      title: "Thank you!",
      message: "We welcome you to our application!",
      type: role
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        role: user.role,
        userName: user.userName,
        email: user.email,
        contactNumber: user.contactNumber,
        licenseImage: user.licenseImage,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== role) return res.status(400).json({ message: "Role does not match" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const contactNumberExits = async (req, res) => {
  const { contactNumber } = req.body;
  try {
    if (!contactNumber) return res.status(400).json({ message: "Contact number is required" });
    const user = await User.findOne({ contactNumber });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User exists", userId: user._id, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { emailOrPhone, newPassword } = req.body;
  try {
    if (!emailOrPhone || !newPassword) return res.status(400).json({ message: "All fields required" });
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { contactNumber: emailOrPhone }] });
    if (!user) return res.status(404).json({ message: "User not found" });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const posts = await FoodPost.find({ createdBy: user._id }).sort({ createdAt: -1 });
    res.status(200).json({ user, posts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const searchUsersProfile = async (req, res) => {
  const { query } = req.params;
  try {
    const regex = new RegExp(query, 'i');
    const results = await User.find({ userName: regex }).select('_id userName profileImage role');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProfileAndPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('subscribers', '_id');
    const posts = await FoodPost.find({ createdBy: req.params.id });
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleSubscribe = async (req, res) => {
  try {
    const { currentUserId } = req.body;
    const targetUser = await User.findById(req.params.targetId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    const isSubscribed = targetUser.subscribers.includes(currentUserId);
    if (isSubscribed) {
      targetUser.subscribers = targetUser.subscribers.filter(id => id.toString() !== currentUserId);
    } else {
      targetUser.subscribers.push(currentUserId);
    }
    await targetUser.save();
    res.json({ message: 'Subscription updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const userProfileDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'userName email contactNumber role profileImage operatingHours cuisineType'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, operatingHours, cuisineType } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.userName = userName || user.userName;
    user.operatingHours = operatingHours || user.operatingHours;
    if (user.role === "restaurant" && cuisineType) user.cuisineType = cuisineType;
    if (req.file) user.profileImage = await uploadToCloudinary(req.file.buffer, 'shareabite/profiles');
    await user.save();
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const requestFood = async (req, res) => {
  try {
    const { postId, requesterId, receiverId } = req.body;
    const alreadyRequested = await FoodRequest.findOne({ postId, requesterId });
    if (alreadyRequested) return res.status(400).json({ message: 'Already requested.' });
    const newRequest = new FoodRequest({ postId, requesterId, receiverId, status: 'pending' });
    await newRequest.save();
    res.status(201).json({ message: 'Request sent successfully.', request: newRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create food post — images optional, reads donor from JWT
export const createPost = async (req, res) => {
  try {
    const { foodType, quantity, quantityUnit, bestBefore, description, area, latitude, longitude } = req.body;
    const createdBy = req.user?._id || req.body.createdBy;

    if (!foodType || !quantity || !bestBefore || !createdBy) {
      return res.status(400).json({ message: "foodType, quantity, and bestBefore are required." });
    }

    let foodImages = [];
    if (req.files && req.files.length > 0) {
      foodImages = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'shareabite/posts'))
      );
    }

    const newPost = new FoodPost({
      foodType,
      quantity: Number(quantity),
      quantityUnit: quantityUnit || 'servings',
      bestBefore: new Date(bestBefore),
      description: description || '',
      area: area || '',
      createdBy,
      latitude,
      longitude,
      foodImages,
      status: 'active',
    });

    const savedPost = await newPost.save();
    res.status(201).json({ message: "Food post created successfully", post: savedPost });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all active posts for the charity food feed — auto-expire at query time
export const getAllPosts = async (req, res) => {
  try {
    const now = new Date();

    const posts = await FoodPost.find({
      status: { $in: ['active', 'available'] },
      bestBefore: { $gt: now },
    })
      .sort({ bestBefore: 1 })
      .populate("createdBy", "_id userName role profileImage");

    const formatted = posts.map(post => ({
      _id: post._id,
      userName: post.createdBy?.userName || "Unknown",
      userImage: post.createdBy?.profileImage || "",
      role: post.createdBy?.role,
      createdBy: post.createdBy?._id,
      foodType: post.foodType,
      quantity: post.quantity,
      quantityUnit: post.quantityUnit || 'servings',
      area: post.area || '',
      bestBefore: post.bestBefore,
      description: post.description,
      images: post.foodImages,
      latitude: post.latitude,
      longitude: post.longitude,
      status: post.status,
      createdAt: post.createdAt,
    }));

    res.status(200).json({ posts: formatted });
  } catch (error) {
    res.status(500).json({ error: "Failed to load posts" });
  }
};

// Mark post as fulfilled (donor confirms pickup happened)
export const fulfillPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await FoodPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    post.status = 'fulfilled';
    await post.save();
    res.status(200).json({ message: 'Post marked as fulfilled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Donor cancels a post — auto-rejects all pending requests
export const cancelPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const io = req.app.get('io');

    const post = await FoodPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const pendingRequests = await FoodRequest.find({ postId, status: 'pending' });
    await FoodRequest.updateMany({ postId, status: { $in: ['pending', 'accepted'] } }, { status: 'rejected' });

    for (const request of pendingRequests) {
      io.to(request.requesterId.toString()).emit('charity_notification', {
        postId,
        type: 'cancelled',
        message: 'The food post has been cancelled by the donor.',
      });
    }

    post.status = 'cancelled';
    await post.save();

    res.status(200).json({ message: 'Post cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Undo acceptance within the 5-minute window
export const undoAcceptPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await FoodPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (post.status !== 'accepted') {
      return res.status(400).json({ message: 'Post is not in accepted state' });
    }

    post.status = 'active';
    post.acceptedBy = null;
    await post.save();

    await FoodRequest.updateMany({ postId }, { status: 'pending' });

    res.status(200).json({ message: 'Acceptance undone. Post is active again.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deletePostById = async (req, res) => {
  const { postId } = req.params;
  const requesterId = req.user._id;
  try {
    const post = await FoodPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.createdBy.toString() !== requesterId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    await FoodPost.deleteOne({ _id: postId });
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting post' });
  }
};

export const updatePostById = async (req, res) => {
  try {
    const { foodType, quantity, bestBefore, description, area, quantityUnit } = req.body;
    const post = await FoodPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }
    if (foodType) post.foodType = foodType;
    if (quantity) post.quantity = quantity;
    if (bestBefore) post.bestBefore = bestBefore;
    if (description !== undefined) post.description = description;
    if (area !== undefined) post.area = area;
    if (quantityUnit) post.quantityUnit = quantityUnit;
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating post' });
  }
};
