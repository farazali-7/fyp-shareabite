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
  deletePostById,
  fulfillPost,
  cancelPost,
  undoAcceptPost,
} from "../controllers/userController.js";

import upload from "../middlewares/uploadMiddleware.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Post lifecycle
router.patch('/posts/:postId/fulfill', protect, fulfillPost);
router.patch('/posts/:postId/cancel', protect, cancelPost);
router.patch('/posts/:postId/undo-accept', protect, undoAcceptPost);
router.delete('/:postId', protect, deletePostById);
router.put('/:postId', protect, updatePostById);

// Auth
router.post("/check-user", checkUserExists);
router.post("/register", upload.single("licenseImage"), registerUser);
router.post("/login", loginUser);
router.post("/check-contact", contactNumberExits);
router.post("/reset-password", resetPassword);

// Profile
router.get("/profile", protect, getUserProfile);
router.put("/updateProfile/:id", protect, upload.single("profileImage"), updateUserProfile);
router.get("/search/:query", searchUsersProfile);
router.get("/profile/:id", getProfileAndPosts);
router.get("/profile/details/:id", userProfileDetails);
router.post("/subscribe/:targetId", protect, toggleSubscribe);

// Posts
router.post('/create', protect, upload.array('images', 5), createPost);
router.get('/all', getAllPosts);

// Legacy request (kept for backward compat)
router.post('/request', requestFood);

// Status
router.get('/:userId/status', getUserStatusById);

export default router;
