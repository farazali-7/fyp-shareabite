import express from "express";
import {
  checkUserExists,
  registerUser,
  updateUserProfile,
  loginUser,
  contactNumberExits,
  resetPassword,
  getUserProfile,
  searchUsersProfile,
  getProfileAndPosts,
  toggleSubscribe,
  userProfileDetails,
  createPost,
  requestFood,
  getAllPosts,
  getUserStatusById,
  updatePostById,
  deletePostById

} from "../controllers/userController.js";

import upload from "../middlewares/uploadMiddleware.js";
import protect from "../middlewares/authMiddleware.js";
const router = express.Router();



router.delete('/:postId', protect, deletePostById);
router.put('/:postId', protect, updatePostById);
//Edit Profile
router.put(
  "/updateProfile/:id",
  protect,
  upload.single("profileImage"),
  updateUserProfile
);

//  Check if user already exists by email or phone
router.post("/check-user", checkUserExists);

//  Register a user (with license image)
router.post("/register", upload.single("licenseImage"), registerUser);

//  Login user
router.post("/login", loginUser);

//  Check contact number exists (OTP step)
router.post("/check-contact", contactNumberExits);

//  Reset password (via email or phone)
router.post("/reset-password", resetPassword);

//  Get logged-in user's profile & posts
router.get("/profile", protect, getUserProfile);
router.post('/create', upload.array('images'), createPost);

//  Update logged-in user's profile
router.put("/updateProfile/:id", protect, upload.single("profileImage"), updateUserProfile);

//  Search users by name
router.get("/search/:query", searchUsersProfile);

//  Get public profile and posts of a user
router.get("/profile/:id", getProfileAndPosts);

//  Get full user profile details (for ViewProfileDetails screen)
router.get("/profile/details/:id", userProfileDetails);

//  Subscribe / Unsubscribe to a user
router.post("/subscribe/:targetId", protect, toggleSubscribe);

// post food
router.post(
  "/create",
  upload.array('images', 5), 
  createPost
);

//request for food 
router.post('/request', requestFood);

// GET /api/posts/all
router.get('/all', getAllPosts);


router.get('/:userId/status', getUserStatusById);

export default router;
