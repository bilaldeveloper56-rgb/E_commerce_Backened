import express from "express";
import { config } from "dotenv";
import { connection } from "./src/config/db.js";
import allroutes from "./src/routes/index.js";
import errorHandler from "./src/middleware/errormiddlwware.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { cloudinaryConfig } from "./src/config/cloudinary.js";

config();
cloudinaryConfig();

const app = express();
connection();
app.use(cookieParser());

// Build allowed origins list — include localhost for dev + Vercel URL for production
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];
 
// Add production frontend URL from environment variable (set this on Vercel)
if (process.env.FRONTEND_URL) {
  const origin = process.env.FRONTEND_URL.replace(/\/$/, "");
  allowedOrigins.push(origin);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

// Root route handler for deployment verification and health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Backend API Server is running successfully!",
  });
});

app.use("/api", allroutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
