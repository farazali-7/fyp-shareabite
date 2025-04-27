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
export const loggedin = async (req, res) => {


  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: "7d" } // token expires in 7 days
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        role: user.role,
        contactNumber: user.contactNumber,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }

};





// Update user profile data
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userName, contactNumber , email ,password} = req.body;
    const licenseImage = req.file ? req.file.path : undefined;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userName, contactNumber, licenseImage ,  email ,password},
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
