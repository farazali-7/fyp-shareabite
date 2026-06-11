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
import validate from '../middlewares/validate.js';
import {
  searchUsersSchema,
  createChatSchema,
  sendMessageSchema,
  chatIdParamSchema,
} from '../validation/chat.validation.js';

const router = express.Router();

router.get('/search/users', protect, validate(searchUsersSchema), searchUsers);

router.get('/',  protect, getUserChats);
router.post('/', protect, validate(createChatSchema), createChat);

router.get( '/:chatId/messages',  protect, validate(chatIdParamSchema), getMessages);
router.post('/:chatId/messages',  protect, validate(sendMessageSchema), sendMessage);
router.patch('/:chatId/mark-read', protect, validate(chatIdParamSchema), markAsRead);

export default router;
