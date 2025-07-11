
import express from 'express';
import { createRequest } from '../controllers/requestController.js';
import {getRequestedNotifications} from '../controllers/requestController.js'

const router = express.Router();

// Create a food request
router.post('/create', createRequest);

router.get('/requested-notifications/:userId' , getRequestedNotifications)
export default router;
