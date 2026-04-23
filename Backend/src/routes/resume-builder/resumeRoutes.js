import express from "express";
import {
  createResume,
  deleteResume,
  getAllResumes,
  getPublicResumeById,
  getResumeById,
  updateResume,
} from "../../controllers/resume-builder/resumeController.js";
import upload from "../../config/multerResume.js";

const resumeRouter = express.Router();

resumeRouter.get("/list", getAllResumes);
resumeRouter.post("/create", createResume);
resumeRouter.put("/update", upload.single("image"), updateResume);
resumeRouter.delete("/delete/:resumeId", deleteResume);
resumeRouter.get("/get/:resumeId", getResumeById);
resumeRouter.get("/public/:resumeId", getPublicResumeById);

export default resumeRouter;