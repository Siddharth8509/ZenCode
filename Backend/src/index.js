// This is the backend entry point.
// It boots Express, connects the supporting services, and mounts every API router.
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import dbConnection from "./config/database.js";
import authRouter from "./routes/auth.routes.js";
import redisClient from "./config/redis.js";
import problemRouter from "./routes/problem.routes.js";
import submissionRouter from "./routes/submission.routes.js";
import aiRouter from "./routes/ai.routes.js";
import cors from "cors";
import { fileURLToPath } from "url";
import questionRoutes from "./routes/aptitude/questionRoutes.js";
import learnRoutes from "./routes/aptitude/learnRoute.js";
import pdfRoutes from "./routes/aptitude/pdfRoutes.js";
import geminiRoutes from "./routes/aptitude/geminiRoutes.js";
import authMiddleware from "./middleware/auth.middleware.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });
const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://zencode-project.vercel.app'
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

const port = process.env.PORT || 3000;

async function connection() {
    try {
        await redisClient.connect();
        console.log("Redis client is connected");
    } catch (err) {
        console.error("Redis connection error:", err);
    }

    try {
        await dbConnection();
        console.log("Connected to database");
    } catch (err) {
        console.error("Database connection error:", err);
    }

    app.listen(port, () => {
        console.log(`Server is running on port no. ${port}`);
    });
}

connection();

app.get("/", (req, res) => {
    res.status(200).json({ status: "success", message: "ZenCode Backend is running!" });
});

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submissionRouter);
app.use("/ai", aiRouter);

// Aptitude Routes (Authenticated)
app.use("/aptitude/questions", authMiddleware, questionRoutes);
app.use("/aptitude/learn", authMiddleware, learnRoutes);
app.use("/aptitude/pdfs", authMiddleware, pdfRoutes);
app.use("/aptitude/gemini", authMiddleware, geminiRoutes);
