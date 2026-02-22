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

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submissionRouter);
// If not on Vercel, start the server normally. If on Vercel, export the app.
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
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
} else {
    // For Vercel Serverless environment, we still need to ensure DB connections
    // before the first request, but Vercel handles the listening.
    // The easiest way is to let the first request trigger the connection.
    let isConnected = false;
    app.use(async (req, res, next) => {
        if (!isConnected) {
            try {
                await dbConnection();
                // Optionally connect Redis here if using Upstash or similar external Redis
                // await redisClient.connect(); 
                isConnected = true;
                console.log("Serverless functions connected to database");
            } catch (err) {
                console.error("Failed to connect to database in serverless function:", err);
            }
        }
        next();
    });
}

// Required for Vercel Serverless Functions
export default app;
