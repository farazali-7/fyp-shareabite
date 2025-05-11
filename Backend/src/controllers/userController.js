import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import FoodPost from '../models/post.js';//Post
import FoodRequest from '../models/request.js';

const JWT_SECRET = process.env.JWT_SECRET || "secretkey"; 


//check if user already exists 

export const checkUserExists = async (req, res) => {
  try {
    const { email, contactNumber,  } = req.body;

    const user = await User.findOne({
      $or: [{ email }, { contactNumber }],
    });

    if (user) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};



//register user
export const registerUser = async (req, res) => {
  try {
    console.log("request body ", req.body);

    const { role, userName, email, contactNumber, password } = req.body;
    const licenseImage = req.file ? req.file.path : req.body.licenseImage || null; 

    if (!role || !userName || !email || !contactNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    
    const existingUser = await User.findOne({
      $or: [{ email }, { contactNumber }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = new User({
      role,
      userName,
      email,
      contactNumber,
      password: hashedPassword,
      licenseImage,
    });

    const user = await newUser.save();

    const notification = new Notification({
      user: user._id,
      title: "Thank you!",
      message: "We welcome you to our application! Great to see you here!",
      type: role
    })

    await notification.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        role: newUser.role,
        userName: newUser.userName,
        email: newUser.email,
        contactNumber: newUser.contactNumber,
        licenseImage: newUser.licenseImage,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




//login user 
export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check role match
    if (user.role !== role) {
      return res.status(400).json({ message: "Role does not match" });
    }

    // Check password match
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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




//to check that user with particular contact no already exists {to proceed to otp verification}

export const contactNumberExits = async (req, res) => {
  const { contactNumber } = req.body;

  try {
    if (!contactNumber) {
      return res.status(400).json({ message: "Contact number is required" });
    }

    const user = await User.findOne({ contactNumber });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User exists",
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




//Reset password in case of forgot password 
export const resetPassword = async (req, res) => {
  const { emailOrPhone, newPassword } = req.body;

  try {
    if (!emailOrPhone || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { contactNumber: emailOrPhone }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


//Fetch user profile information and posts 

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
//Posts

//search profiles 
export const searchUsersProfile = async (req, res) => {
  const { query } = req.params;
  try {
    const regex = new RegExp(query, 'i'); 
    const results = await User.find({ userName: regex })
      .select('_id userName profileImage'); 
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//  View Profile & Posts on the visting saerching profile
export const getProfileAndPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('subscribers', '_id');

    const posts = await FoodPost.find({ user: req.params.id });

    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Subscription and Unsubscription Handling
export const toggleSubscribe = async (req, res) => {
  try {
    const { currentUserId } = req.body;
    const targetUser = await User.findById(req.params.targetId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSubscribed = targetUser.subscribers.includes(currentUserId);
    if (isSubscribed) {
      targetUser.subscribers = targetUser.subscribers.filter(
        (id) => id.toString() !== currentUserId
      );
    } else {
      targetUser.subscribers.push(currentUserId);
    }

    await targetUser.save();
    res.json({ message: 'Subscription updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//own Profile Details
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


//Edit Profile 
// PUT /api/users/updateProfile/:id
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, operatingHours, cuisineType } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.userName = userName || user.userName;
    user.operatingHours = operatingHours || user.operatingHours;

    if (user.role === "restaurant" && cuisineType) {
      user.cuisineType = cuisineType;
    }

    if (req.file) {
      user.profileImage = `${req.file.path}`;
    }

    await user.save();
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


import Notification from "../models/notification.js";

export const createPost = async (req, res) => {
  try {
    const {
      foodType,
      quantity,
      bestBefore,
      description,
      createdBy,
      latitude,
      longitude,
    } = req.body;

    console.log(req.body)

    // Validation
    if (!foodType || !quantity || !bestBefore || !description || !createdBy) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Images check
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required.' });
    }

    // Map uploaded images
    const foodImages = req.files.map(file => `/uploads/posts/${file.filename}`);

    // Create and save post
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

    const resturant = await User.findById(createdBy)

    const notification = new Notification({
      user: null,
      post: savedPost._id,
      title: `${resturant.userName} posted!`,
      description: `${foodType} with ${quantity} quantity have been posted by a resturant checkout to see what is there for you!`,
      type: "charity"
    })

    const result = await notification.save();

    console.log(result)

    res.status(201).json({
      message: 'Food post created successfully',
      post: newPost,
    });
  } catch (err) {
    console.error(' Post creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


//food Request Details 
// controllers/requestController.js
export const requestFood = async (req, res) => {
  try {
    const { postId, requesterId, receiverId } = req.body;

    // Using the correct Mongoose model: FoodRequest
    const alreadyRequested = await FoodRequest.findOne({ postId, requesterId });

    if (alreadyRequested) {
      return res.status(400).json({ message: 'Already requested.' });
    }

    const newRequest = new FoodRequest({
      postId,
      requesterId,
      receiverId,
      status: 'pending',
    });

    await newRequest.save();

    res.status(201).json({ message: 'Request sent successfully.', request: newRequest });
  } catch (err) {
    console.error(' Error creating request:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};




export const getCharityNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ type: 'charity' }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching charity notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

//get all post for home page
export const getAllPosts = async (req, res) => {
  try {
    const posts = await FoodPost.find()
      .sort({ createdAt: -1 }) // latest first
      .populate('createdBy'); // only include relevant user info

    const formatted = posts.map((post) => ({
      _id: post._id,
      userName: post.createdBy?.userName || 'Unknown',
      userImage: post.createdBy?.profileImage || '',
      role: post.createdBy?.role,
      foodType: post.foodType,
      quantity: post.quantity,
      bestBefore: post.bestBefore,
      description: post.description,
      images: post.foodImages,
      location: post.location,
    }));

    res.status(200).json({ posts: formatted });
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to load posts' });
  }
};