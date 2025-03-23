import User from "../models/user.js";
import bcrypt from "bcrypt";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    console.log("request body ", req.body)
    const { role, userName, email, contactNumber, password } = req.body;
    const licenseImage = req.file ? req.file.path : null; // Uploaded image path

   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
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
    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//login user 
export const loggedin = async (req, res) => {
  try {
    const { email, password } = req.body;

  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

   
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    //  Send success response
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
