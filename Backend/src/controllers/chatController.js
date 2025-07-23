import Chat from '../models/chat.js';
import Message from '../models/message.js';
import User from '../models/user.js';
import mongoose from 'mongoose';

// 1- Search users to start chat
export const searchUsers = async (req, res) => {
  try {
    const query = req.query.query?.trim();
    const userId = req.user._id;

    if (!query || query.length < 2) {
      return res.status(200).json([]);
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { userName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
      .select('_id name userName email profileImage role')
      .limit(20);

    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name || user.userName,
      profilePicture: user.profileImage || 'https://placehold.co/400',
      email: user.email,
      role: user.role
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error(' searchUsers Error:', error.message);
    res.status(500).json({
      error: 'Search failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 2- Create chat with a particular user 
export const createChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot chat with yourself.' });
    }

    let chat = await Chat.findOne({
      'participants.user': { $all: [currentUserId, userId] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [
          { user: currentUserId },
          { user: userId },
        ],
      });
      await chat.save();
    }

    chat = await Chat.findById(chat._id)
      .populate({
        path: 'participants.user',
        select: 'userName profileImage',
      })
      .populate({
        path: 'lastMessage',
        select: 'content timestamp sender',
      });

    res.status(200).json(chat);
  } catch (error) {
    console.error(' Error creating chat:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3- Get user chats to display all the created chats
export const getUserChats = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const chats = await Chat.find({
      'participants.user': currentUserId,
    })
      .populate({
        path: 'participants.user',
        select: 'userName profileImage',
      })
      .populate({
        path: 'lastMessage',
        select: 'content timestamp sender',
      })
      .sort({ updatedAt: -1 });

    const formattedChats = chats.map(chat => {
      const participantsWithFlag = chat.participants.map(p => {
        const isCurrentUser = p.user._id.toString() === currentUserId.toString();
        return {
          _id: p.user._id,
          name: p.user.userName,
          profilePicture: p.user.profileImage,
          isCurrentUser,
        };
      });

      return {
        _id: chat._id,
        lastMessage: chat.lastMessage,
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt,
        unreadCount: chat.unreadCount || 0,
        participants: participantsWithFlag,
      };
    });

    res.status(200).json(formattedChats);
  } catch (error) {
    console.error(' Error fetching user chats:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};



// controllers/messageController.js

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;
    const senderId = req.user?._id;

    if (!content || !chatId) {
      console.warn('Missing content or chatId');
      return res.status(400).json({ message: 'Content and Chat ID are required' });
    }

    // Create and save new message
    const newMessage = await Message.create({
      chat: chatId,
      sender: senderId,
      content,
    });

    // Update chat with lastMessage (using message ID)
    await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

    // Populate sender and chat participants
    const populatedMessage = await newMessage.populate([
      { path: 'sender', select: 'userName profileImage' },
      { path: 'chat', populate: { path: 'participants', select: 'userName profileImage' } }
    ]);

    // Emit message to chat room
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('receiveMessage', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'userName profileImage')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('Get Messages Error:', err);
    res.status(500).json({ message: 'Could not fetch messages' });
  }
};





export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const io = req.app.get('io');

    console.log(`👀 [MARK AS READ] User ${userId} marking chat ${chatId} as read`);

    // Mark messages as read
    const updateResult = await Message.updateMany(
      { 
        chat: chatId, 
        sender: { $ne: userId },
        readBy: { $nin: [userId] } 
      },
      { $addToSet: { readBy: userId } }
    );
    console.log(`📝 Marked ${updateResult.modifiedCount} messages as read`);

    // Reset unread count
    await Chat.updateOne(
      { _id: chatId, 'participants.user': userId },
      { $set: { 'participants.$.unreadCount': 0 } }
    );
    console.log(`🔢 Reset unread count for user ${userId} in chat ${chatId}`);

    // Notify other participants
    io.to(chatId).emit('messageRead', { 
      chatId, 
      userId,
      timestamp: new Date() 
    });
    console.log(`📢 Emitted read receipt for chat ${chatId}`);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ [MARK AS READ ERROR]', {
      error: error.message,
      stack: error.stack,
      chatId: req.params.chatId,
      userId: req.user._id
    });
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};
