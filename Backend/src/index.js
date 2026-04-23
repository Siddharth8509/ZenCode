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
import resumeAnalyzerRouter from "./routes/resumeAnalyzer.routes.js";
import cors from "cors";
import { fileURLToPath } from "url";
import path from 'path';
import questionRoutes from "./routes/aptitude/questionRoutes.js";
import learnRoutes from "./routes/aptitude/learnRoute.js";
import pdfRoutes from "./routes/aptitude/pdfRoutes.js";
import geminiRoutes from "./routes/aptitude/geminiRoutes.js";
import authMiddleware from "./middleware/auth.middleware.js";
import resumeBuilderRouter from "./routes/resume-builder/resumeRoutes.js";
import resumeBuilderAiRouter from "./routes/resume-builder/aiRoutes.js";
import learningRoutes from "./routes/learning.routes.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });
const app = express();
app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://zencode-project.vercel.app'
];

const configuredFrontendOrigins = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

allowedOrigins.push(...configuredFrontendOrigins);

app.use(cors({
    origin: [...new Set(allowedOrigins)],
    credentials: true,
}));

const __uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
app.use('/uploads', express.static(__uploadsDir));

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
app.use("/resume-analyzer", resumeAnalyzerRouter);

app.use("/resume-builder/api/resumes", resumeBuilderRouter);
app.use("/resume-builder/api/ai", resumeBuilderAiRouter);

// Aptitude Routes (Authenticated)
app.use("/aptitude/questions", authMiddleware, questionRoutes);
app.use("/aptitude/learn", authMiddleware, learnRoutes);
app.use("/aptitude/pdfs", authMiddleware, pdfRoutes);
app.use("/aptitude/gemini", authMiddleware, geminiRoutes);

// Learning Routes (Authenticated)
app.use("/learning/api", authMiddleware, learningRoutes);
