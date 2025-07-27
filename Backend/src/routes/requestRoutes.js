
import express from 'express';
import { createRequest , getRequestedNotifications ,
    acceptRequest , rejectRequest , getCharityNotifications,cancelRequest
} from '../controllers/requestController.js';

const router = express.Router();

// Create a food request
router.post('/create', createRequest);

router.delete('/cancel/:requestId', cancelRequest);

//Accept or Reject Routes
router.post('/accept',acceptRequest );
router.post('/reject', rejectRequest );

//Fetching Charity Notifications
router.get('/notifications/charity/:userId', getCharityNotifications);

router.get('/requested-notifications/:userId' , getRequestedNotifications)
export default router;
