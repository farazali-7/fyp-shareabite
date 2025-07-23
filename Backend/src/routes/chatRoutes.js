import express from 'express';
import {
  searchUsers,
  getMessages,
  sendMessage,
  markAsRead,
  getUserChats,
  createChat,
  
} from '../controllers/chatController.js';
import protect from '../middlewares/authMiddleware.js';



const router = express.Router();

// Search routes
router.route('/search/users')
  .get(protect, searchUsers);

// Chat routes
router.route('/')
  .get(protect, getUserChats)     
  .post(protect, createChat);      


// Message routes
router.get('/:chatId/messages', protect, getMessages);

// Send a new message in a chat
router.post('/:chatId/messages', protect, sendMessage);  

// Read status routes
router.route('/:chatId/mark-read')
  .patch(protect, markAsRead);     

export default router;





