import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';



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

    await newUser.save();

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


//Fetch user profile information and posts [Profile Page]
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      user,
      posts
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



//Edit Profile  [if role = restaurant then it will update cuisineType ]
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      userName,
      operatingHours,
      cuisineType,
    } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.userName = userName || user.userName;
    user.operatingHours = operatingHours || user.operatingHours;

  
    if (user.role === "restaurant" && cuisineType) {
      user.cuisineType = cuisineType;
    }

    // If new profile image uploaded
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



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

//  View Profile & Posts on the visting profile
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