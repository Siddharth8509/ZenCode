// Submission routes power the IDE loop:
// run code against sample tests, submit against hidden tests, and review past attempts.
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { submitCode, runCode, getSubmission } from "../controllers/submission.controller.js";

const submissionRouter = express.Router();

submissionRouter.post("/submit/:id",authMiddleware,submitCode);
submissionRouter.post("/run/:id",authMiddleware,runCode);
submissionRouter.get("/getSubmission/:id", authMiddleware, getSubmission);


export default submissionRouter;
