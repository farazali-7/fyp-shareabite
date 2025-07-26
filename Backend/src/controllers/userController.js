import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import FoodPost from '../models/post.js';
import FoodRequest from '../models/request.js';
import Notification from '../models/notification.js';

// GET /api/users/:userId/status
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

// Check if user exists
export const checkUserExists = async (req, res) => {
  try {
    const { email, contactNumber } = req.body;
    const user = await User.findOne({ $or: [{ email }, { contactNumber }] });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Register user
export const registerUser = async (req, res) => {
  try {
    const { role, userName, email, contactNumber, password } = req.body;
    const licenseImage = req.file ? req.file.path : req.body.licenseImage || null;

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
      message: "We welcome you to our application! Great to see you here!",
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

// Login user
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

// Check if contact number exists
export const contactNumberExits = async (req, res) => {
  const { contactNumber } = req.body;
  try {
    if (!contactNumber) return res.status(400).json({ message: "Contact number is required" });

    const user = await User.findOne({ contactNumber });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User exists",
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Reset password
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

// Get current user's profile & posts
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

// Search user profiles
export const searchUsersProfile = async (req, res) => {
  const { query } = req.params;
  try {
    const regex = new RegExp(query, 'i');
    const results = await User.find({ userName: regex }).select('_id userName profileImage');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View another profile & posts
export const getProfileAndPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('subscribers', '_id');
    const posts = await FoodPost.find({ user: req.params.id });
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Subscribe/Unsubscribe
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

// Own profile details
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

// Edit profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, operatingHours, cuisineType } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.userName = userName || user.userName;
    user.operatingHours = operatingHours || user.operatingHours;
    if (user.role === "restaurant" && cuisineType) user.cuisineType = cuisineType;
    if (req.file) user.profileImage = req.file.path;

    await user.save();
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Request food
export const requestFood = async (req, res) => {
  try {
    const { postId, requesterId, receiverId } = req.body;
    const alreadyRequested = await FoodRequest.findOne({ postId, requesterId });

    if (alreadyRequested) {
      return res.status(400).json({ message: 'Already requested.' });
    }

    const newRequest = new FoodRequest({ postId, requesterId, receiverId, status: 'pending' });
    await newRequest.save();

    res.status(201).json({ message: 'Request sent successfully.', request: newRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create food post
export const createPost = async (req, res) => {
  try {
    const { foodType, quantity, bestBefore, description, createdBy, latitude, longitude } = req.body;

    if (!foodType || !quantity || !bestBefore || !description || !createdBy) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    const foodImages = req.files.map(file => `/uploads/posts/${file.filename}`);
    const newPost = new FoodPost({
      foodType,
      quantity,
      bestBefore: new Date(bestBefore),
      description,
      createdBy,
      latitude,
      longitude,
      foodImages,
    });

    const savedPost = await newPost.save();
    res.status(201).json({ message: "Food post created successfully", post: savedPost });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await FoodPost.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "_id userName role profileImage");

    const host = req.protocol + "://" + req.get("host");

    const formatted = posts.map(post => {
      const profileImageUrl = post.createdBy?.profileImage
        ? `${host}${post.createdBy.profileImage}`
        : "";

      const foodImageUrls = post.foodImages.map(img => {
        return img.startsWith("/uploads/") ? `${host}${img}` : img;
      });

      return {
        _id: post._id,
        userName: post.createdBy?.userName || "Unknown",
        userImage: profileImageUrl,
        role: post.createdBy?.role,
        createdBy: post.createdBy?._id,
        foodType: post.foodType,
        quantity: post.quantity,
        bestBefore: post.bestBefore,
        description: post.description,
        images: foodImageUrls,
        latitude: post.latitude,
        longitude: post.longitude,
        status: post.status,
        createdAt: post.createdAt,
      };
    });

    res.status(200).json({ posts: formatted });
  } catch (error) {
    res.status(500).json({ error: "Failed to load posts" });
  }
};
