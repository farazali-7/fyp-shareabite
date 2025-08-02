
import express from 'express';
import { createRequest , 
    getRequestedNotifications ,cancelRequest , checkExistingRequest,
    acceptRequest , rejectRequest , getCharityNotifications, 
} from '../controllers/requestController.js';

const router = express.Router();

// Create a food request
router.post('/create', createRequest);

router.get(
  '/check/:postId/:requesterId',
  checkExistingRequest
);router.post('/cancel', cancelRequest);
//Accept or Reject Routes
router.post('/accept',acceptRequest );
router.post('/reject', rejectRequest );

//Fetching Charity Notifications
router.get('/notifications/charity/:userId', getCharityNotifications);

router.get('/requested-notifications/:userId' , getRequestedNotifications)
export default router;
