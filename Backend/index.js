import express from "express";
import connectDB from "./src/config/db.js";
import cors from "cors";
import userRoutes from "./src/routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";


const app = express();

// Convert `__dirname` for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB(); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors()); 

app.use("/api/users", userRoutes);
app.use("/uploads/posts", express.static(path.join(__dirname, "src/uploads"))); // Serve uploaded images

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port '+ PORT);
  });
