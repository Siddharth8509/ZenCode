// AI routes keep the frontend talking to Gemini through the backend,
// which is safer and more reliable in production deployments.
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    generateChatReply,
    generateMockInterviewFeedback,
    generateMockInterviewQuestions,
} from "../controllers/ai.controller.js";

const aiRouter = express.Router();

aiRouter.post("/chat", authMiddleware, generateChatReply);
aiRouter.post("/mock-interview/questions", authMiddleware, generateMockInterviewQuestions);
aiRouter.post("/mock-interview/feedback", authMiddleware, generateMockInterviewFeedback);

export default aiRouter;
