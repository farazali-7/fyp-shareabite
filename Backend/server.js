import express from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";
import cors from "cors";
import userRoutes from "./src/routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import requestRoutes from './src/routes/requestRoutes.js';
import chatRoutes from "./src/routes/chatRoutes.js";
import adminRoutes from './src/routes/adminRoutes.js';
import Chat from './src/models/chat.js';
import Message from './src/models/message.js';
import Notification from './src/models/notification.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.set('io', io);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/admin", adminRoutes);

io.on("connection", (socket) => {
  socket.on("join_chat", (chatId) => socket.join(chatId));
  socket.on("register_user", (userId) => socket.userId = userId);

  socket.on("request_food", async ({ senderId, receiverId, postId }) => {
    try {
      const newNotification = await Notification.create({
        sender: senderId,
        receiver: receiverId,
        type: "request",
        post: postId,
      });

      const populated = await newNotification.populate([
        { path: 'sender', select: 'userName profileImage' },
        { path: 'post' }
      ]);

      io.emit("new_request", populated);
    } catch (error) {
      console.error("request_food error:", error.message);
    }
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

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 3009;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
