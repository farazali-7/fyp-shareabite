import Chat from '../models/chat.js';
import Message from '../models/message.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { AppError } from '../errors/AppError.js';
import { ForbiddenError } from '../errors/ForbiddenError.js';

export const searchUsers = asyncHandler(async (req, res) => {
  // query has been regex-escaped by the validation schema (ReDoS prevention)
  const query = req.query.query?.trim();
  const userId = req.user._id;

  if (!query || query.length < 2) {
    return res.status(200).json([]);
  }

  const users = await User.find({
    _id: { $ne: userId },
    $or: [
      { userName: { $regex: query, $options: 'i' } },
      { email:    { $regex: query, $options: 'i' } },
    ],
  })
    .select('_id userName email profileImage role')
    .limit(20);

  const formatted = users.map((u) => ({
    _id:            u._id,
    name:           u.userName,
    profilePicture: u.profileImage || null,
    email:          u.email,
    role:           u.role,
  }));

  res.status(200).json(formatted);
});

export const createChat = asyncHandler(async (req, res, next) => {
  const { userId } = req.body; // already validated as ObjectId by validate middleware
  const currentUserId = req.user._id;

  if (userId === currentUserId.toString()) {
    return next(new AppError('You cannot start a chat with yourself.', 400, 'VALIDATION_ERROR'));
  }

  let chat = await Chat.findOne({
    'participants.user': { $all: [currentUserId, userId] },
  });

  if (!chat) {
    chat = new Chat({
      participants: [{ user: currentUserId }, { user: userId }],
    });
    await chat.save();
  }

  chat = await Chat.findById(chat._id)
    .populate({ path: 'participants.user', select: 'userName profileImage' })
    .populate({ path: 'lastMessage', select: 'content timestamp sender' });

  res.status(200).json(chat);
});

export const getUserChats = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const chats = await Chat.find({ 'participants.user': currentUserId })
    .populate({ path: 'participants.user', select: 'userName profileImage' })
    .populate({ path: 'lastMessage', select: 'content timestamp sender' })
    .sort({ updatedAt: -1 });

  const formatted = chats.map((chat) => {
    const participants = chat.participants.map((p) => ({
      _id:          p.user._id,
      name:         p.user.userName,
      profilePicture: p.user.profileImage,
      isCurrentUser: p.user._id.toString() === currentUserId.toString(),
    }));
    return {
      _id:         chat._id,
      lastMessage: chat.lastMessage,
      updatedAt:   chat.updatedAt,
      createdAt:   chat.createdAt,
      unreadCount: chat.unreadCount || 0,
      participants,
    };
  });

  res.status(200).json(formatted);
});

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { content, chatId } = req.body; // both validated by schema
  const senderId = req.user._id;

  const chat = await Chat.findOne({ _id: chatId, 'participants.user': senderId }).select('_id');
  if (!chat) return next(new ForbiddenError('You are not a participant of this chat.'));

  const newMessage = await Message.create({ chat: chatId, sender: senderId, content });
  await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

  const populated = await newMessage.populate([
    { path: 'sender', select: 'userName profileImage' },
    { path: 'chat', populate: { path: 'participants', select: 'userName profileImage' } },
  ]);

  const io = req.app.get('io');
  if (io) io.to(chatId).emit('receiveMessage', populated);

  res.status(201).json(populated);
});

export const getMessages = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params; // validated as ObjectId by schema

  const chat = await Chat.findOne({ _id: chatId, 'participants.user': req.user._id }).select('_id');
  if (!chat) return next(new ForbiddenError('You are not a participant of this chat.'));

  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'userName profileImage')
    .sort({ createdAt: 1 });

  res.status(200).json(messages);
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params; // validated as ObjectId by schema
  const userId = req.user._id;
  const io = req.app.get('io');

  const chat = await Chat.findOne({ _id: chatId, 'participants.user': userId }).select('_id');
  if (!chat) return next(new ForbiddenError('You are not a participant of this chat.'));

  await Message.updateMany(
    { chat: chatId, sender: { $ne: userId }, readBy: { $nin: [userId] } },
    { $addToSet: { readBy: userId } }
  );

  await Chat.updateOne(
    { _id: chatId, 'participants.user': userId },
    { $set: { 'participants.$.unreadCount': 0 } }
  );

  if (io) io.to(chatId).emit('messageRead', { chatId, userId, timestamp: new Date() });

  res.status(200).json({ success: true });
});
