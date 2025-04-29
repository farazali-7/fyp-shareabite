import express from "express";
import {checkUserExists, registerUser, updateUser , loggedin} from "../controllers/userController.js";
import upload from "../middlewares/uploadMiddleware.js"; // Middleware for image upload
import { getUserProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();


//edit profile 
router.put("/updateProfile/:id", protect, upload.single("profileImage"), updateUserProfile);

//main profile
router.get("/profile", protect, getUserProfile);

//check if user already exists 
router.post("/check-user" ,checkUserExists )
// Register User
router.post("/register", upload.single("licenseImage"), registerUser);

//logedin user 
router.post("/login",  loggedin);

// Update User Profile
router.put("/update/:userId", upload.single("licenseImage"), updateUser);

export default router;
