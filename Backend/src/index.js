import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import dbConnection from "./config/database.js";
import authRouter from "./routes/auth.routes.js";
import redisClient from "./config/redis.js";
import problemRouter from "./routes/problem.routes.js";
import submissionRouter from "./routes/submission.routes.js";
import cors from "cors";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
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
