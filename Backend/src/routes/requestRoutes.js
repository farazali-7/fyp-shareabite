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

const router = express.Router();

// Donor: all requests on their posts, grouped by post
router.get('/my-post-requests', protect, getMyPostRequests);

// Charity: all requests they submitted
router.get('/my-requests', protect, getMyRequests);

// Create / cancel
router.post('/create', createRequest);
router.post('/cancel', cancelRequest);

// Check
router.get('/check/:postId/:requesterId', checkExistingRequest);

// Accept / Reject
router.post('/accept', acceptRequest);
router.post('/reject', rejectRequest);

// Legacy notification endpoints
router.get('/notifications/charity/:userId', getCharityNotifications);
router.get('/requested-notifications/:userId', getRequestedNotifications);

export default router;
