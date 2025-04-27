import express from "express";
import {checkUserExists, registerUser, updateUser , loggedin} from "../controllers/userController.js";
import upload from "../middlewares/uploadMiddleware.js"; // Middleware for image upload



const router = express.Router();



//check if user already exists 
router.post("/check-user" ,checkUserExists )
// Register User
router.post("/register", upload.single("licenseImage"), registerUser);

//logedin user 
router.post("/login",  loggedin);

// Update User Profile
router.put("/update/:userId", upload.single("licenseImage"), updateUser);

export default router;
