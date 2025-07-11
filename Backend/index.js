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




dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for dev
    methods: ["GET", "POST"],
  },
});



// Convert `__dirname` for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB(); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors()); 
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  next();
});


app.use("/api/users", userRoutes);
app.use("/uploads/posts", express.static(path.join(__dirname, "src/uploads"))); // Serve uploaded images
app.use('/api/requests', requestRoutes);




// Socket.IO logic
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // Join post room
  socket.on("join_post_room", (postId) => {
    socket.join(postId);
    console.log(` Socket joined room: ${postId}`);
  });

  // Send notification only to the post owner
  socket.on("request_food", async (data) => {
    const { postId, requesterId, receiverId } = data;

    console.log("📥 Received request_food:", data);

    // Emit notification to restaurant user (receiverId)
    io.to(receiverId).emit("new_notification", {
      postId,
      requesterId,
      receiverId,
      type: 'request',
      title: ' New Food Request',
      description: 'A charity has requested your food post.',
      createdAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log(" Disconnected:", socket.id);
  });
});





const PORT = process.env.PORT || 3003;
server.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port '+ PORT);
  });

