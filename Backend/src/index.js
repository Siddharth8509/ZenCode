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

// Database connection (Mongoose buffers commands, so we can call this unconditionally)
dbConnection().then(() => console.log("DB Connected")).catch(err => console.error("DB Error:", err));

// Add a simple ping route to verify the Vercel function is alive
app.get("/", (req, res) => {
    res.status(200).json({ status: "success", message: "ZenCode Backend is running!" });
});

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submissionRouter);

// If running locally (not on Vercel), start the listener
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    const port = process.env.PORT || 3000;

    // Connect Redis only locally to prevent Vercel crashes if no Upstash URL is provided
    redisClient.connect()
        .then(() => console.log("Redis connected locally"))
        .catch(err => console.error("Local Redis error:", err));

    app.listen(port, () => {
        console.log(`Local server is running on port no. ${port}`);
    });
}

// Required for Vercel Serverless Functions
export default app;
