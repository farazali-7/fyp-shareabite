import express from 'express';
import {
  createRequest,
  getRequestedNotifications,
  cancelRequest,
  checkExistingRequest,
  acceptRequest,
  rejectRequest,
  getCharityNotifications,
  getMyPostRequests,
  getMyRequests,
} from '../controllers/requestController.js';
import protect from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import {
  createRequestSchema,
  acceptRejectRequestSchema,
  cancelRequestSchema,
} from '../validation/request.validation.js';

const router = express.Router();

// Donor: all requests on their posts
router.get('/my-post-requests', protect, getMyPostRequests);

// Charity: all requests they submitted
router.get('/my-requests', protect, getMyRequests);

// Create — requesterId derived from JWT, not body
router.post('/create', protect, validate(createRequestSchema), createRequest);

// Cancel — only the charity who made the request can cancel it
router.post('/cancel', protect, validate(cancelRequestSchema), cancelRequest);

// Check — read-only existence check; returns no sensitive data
router.get('/check/:postId/:requesterId', checkExistingRequest);

// Accept / Reject — controller verifies post ownership
router.post('/accept', protect, validate(acceptRejectRequestSchema), acceptRequest);
router.post('/reject', protect, validate(acceptRejectRequestSchema), rejectRequest);

// Notification feeds — controller verifies userId === req.user._id
router.get('/notifications/charity/:userId',      protect, getCharityNotifications);
router.get('/requested-notifications/:userId',    protect, getRequestedNotifications);

export default router;
