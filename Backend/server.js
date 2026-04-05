import express from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Route imports
import userRoutes from "./src/routes/userRoutes.js";
import requestRoutes from './src/routes/requestRoutes.js';
import chatRoutes from "./src/routes/chatRoutes.js";
import adminRoutes from './src/routes/adminRoutes.js';
import errorHandler from "./src/middlewares/errorHandler.js";

// Model imports for socket
import Chat from './src/models/chat.js';
import Message from './src/models/message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});
app.set('io', io);

// Connect MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/admin", adminRoutes);

// Global error handler (must be after routes)
app.use(errorHandler);

// Socket.IO — JWT authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "| user:", socket.user?.userId);

  socket.on("join_post_room", (userId) => {
    socket.join(userId);
  });

  socket.on("joinChat", (chatId) => socket.join(chatId));

  socket.on("register_user", (userId) => {
    socket.userId = userId;
  });

  socket.on("request_food", ({ senderId, receiverId, postId }) => {
    io.to(receiverId).emit("new_request", {
      postId,
      senderId,
      message: "A charity has requested your food post.",
    });
  });

  socket.on("sendMessage", async ({ chatId, content, senderId }) => {
    try {
      if (!chatId || !content || !senderId) return;

      const newMessage = await Message.create({
        chat: chatId,
        sender: senderId,
        content,
      });

      await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

      const populatedMessage = await newMessage.populate([
        { path: "sender", select: "userName profileImage" },
        { path: "chat", populate: { path: "participants", select: "userName profileImage" } }
      ]);

      io.to(chatId).emit("receiveMessage", populatedMessage);
    } catch (error) {
      console.error("sendMessage failed:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
