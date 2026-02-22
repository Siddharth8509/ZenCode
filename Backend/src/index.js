import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dbConnection from "./config/database.js";
import authRouter from "./routes/auth.routes.js";
import redisClient from "./config/redis.js";
import problemRouter from "./routes/problem.routes.js";
import submissionRouter from "./routes/submission.routes.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [process.env.CLIENT_URL];
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Database connection management for Serverless
let isConnected = false;
let isRedisConnected = false;

app.use(async (req, res, next) => {
    // Only connect if not already connected (crucial for Vercel warm starts)
    if (!isConnected) {
        try {
            await dbConnection();
            isConnected = true;
            console.log("Database connected successfully");
        } catch (err) {
            console.error("Database connection failed:", err);
            // Don't block the request, let the route handlers fail gracefully if needed
        }
    }

    if (!isRedisConnected && process.env.REDIS_URL) {
        try {
            // Only try connecting if REDIS_URL exists, otherwise skip to avoid hang
            await redisClient.connect();
            isRedisConnected = true;
            console.log("Redis connected successfully");
        } catch (err) {
            console.error("Redis connection failed (Continuing without Redis):", err);
        }
    }

    next();
});

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submissionRouter);

// If running locally (not on Vercel), start the listener
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Local server is running on port no. ${port}`);
    });
}

// Required for Vercel Serverless Functions
export default app;
