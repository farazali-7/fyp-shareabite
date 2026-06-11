import express from 'express';
import {
  checkUserExists,
  registerUser,
  updateUserProfile,
  loginUser,
  contactNumberExits,
  issueResetToken,
  resetPassword,
  getUserProfile,
  searchUsersProfile,
  getProfileAndPosts,
  toggleSubscribe,
  userProfileDetails,
  createPost,
  getAllPosts,
  getUserStatusById,
  updatePostById,
  deletePostById,
  fulfillPost,
  cancelPost,
  undoAcceptPost,
} from '../controllers/userController.js';

import upload from '../middlewares/uploadMiddleware.js';
import protect, { isApproved } from '../middlewares/authMiddleware.js';
import { authLimiter, resetLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  checkUserSchema,
  checkContactSchema,
  issueResetTokenSchema,
  resetPasswordSchema,
} from '../validation/auth.validation.js';
import {
  createPostSchema,
  updatePostSchema,
  postIdParamSchema,
} from '../validation/post.validation.js';
import {
  updateProfileSchema,
  searchSchema,
  subscribeSchema,
  userIdParamSchema,
} from '../validation/user.validation.js';

const router = express.Router();

// ── Post lifecycle (must come before wildcard /:postId routes) ──────────────
router.patch('/posts/:postId/fulfill',     protect, validate(postIdParamSchema),  fulfillPost);
router.patch('/posts/:postId/cancel',      protect, validate(postIdParamSchema),  cancelPost);
router.patch('/posts/:postId/undo-accept', protect, validate(postIdParamSchema),  undoAcceptPost);
router.delete('/:postId',                  protect, validate(postIdParamSchema),  deletePostById);
router.put('/:postId',                     protect, validate(updatePostSchema),    updatePostById);

// ── Auth routes — rate limited ────────────────────────────────────────────────
// For multipart routes (register), multer runs FIRST to populate req.body from
// the form-data, then validate runs on the populated body.
router.post('/check-user',        authLimiter, validate(checkUserSchema),       checkUserExists);
router.post('/register',          authLimiter, upload.single('licenseImage'), validate(registerSchema),       registerUser);
router.post('/login',             authLimiter, validate(loginSchema),           loginUser);
router.post('/check-contact',     authLimiter, validate(checkContactSchema),    contactNumberExits);

// Password reset — two-step, heavily rate limited
router.post('/issue-reset-token', resetLimiter, validate(issueResetTokenSchema), issueResetToken);
router.post('/reset-password',    resetLimiter, validate(resetPasswordSchema),   resetPassword);

// ── Profile routes ────────────────────────────────────────────────────────────
router.get('/profile',             protect, getUserProfile);
router.put('/updateProfile/:id',   protect, upload.single('profileImage'), validate(updateProfileSchema), updateUserProfile);
router.get('/search/:query',       protect, validate(searchSchema), searchUsersProfile);
router.get('/profile/:id',         protect, validate(userIdParamSchema), getProfileAndPosts);
router.get('/profile/details/:id', protect, validate(userIdParamSchema), userProfileDetails);
router.post('/subscribe/:targetId', protect, validate(subscribeSchema), toggleSubscribe);

// ── Food posts ────────────────────────────────────────────────────────────────
// Multer runs FIRST so req.body is populated from multipart form-data before Zod validates.
router.post('/create', protect, upload.array('images', 5), validate(createPostSchema), createPost);
router.get('/all', protect, isApproved, getAllPosts);

// ── Status ────────────────────────────────────────────────────────────────────
router.get('/:userId/status', protect, getUserStatusById);

export default router;
