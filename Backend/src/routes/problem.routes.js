// Problem routes cover both sides of the platform:
// admin problem management and user-facing reads like the problem list and progress stats.
import express from "express";
import adminMiddleware from "../middleware/admin.middleware.js";
const problemRouter = express.Router();
import { createProblem, getProblemById, problemFetchAll, updateProblem, solvedProblemByUser, deleteProblem, getSubmission, getUserActivity } from "../controllers/problem.controller.js"
import { runCode, submitCode } from "../controllers/submission.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

// Admin-only endpoints live together at the top because they change platform content.
problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

// User-facing reads come next. These power the actual solving experience in the app.
problemRouter.get("/user", authMiddleware, solvedProblemByUser);
problemRouter.get("/getProblemById/:id", authMiddleware, getProblemById);
problemRouter.get("/problemById/:id", authMiddleware, getProblemById);
problemRouter.get("/getAllProblems", authMiddleware, problemFetchAll);
problemRouter.get("/submission/:id", authMiddleware, getSubmission);
problemRouter.get("/activity", authMiddleware, getUserActivity);
problemRouter.post("/run/:id", authMiddleware, runCode);
problemRouter.post("/submit/:id", authMiddleware, submitCode);
export default problemRouter;
