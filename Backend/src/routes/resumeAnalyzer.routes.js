import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    analyzeResume,
    deleteResumeAnalysis,
    getResumeAnalysisById,
    getResumeAnalysisHistory,
} from "../controllers/resumeAnalyzer.controller.js";

const resumeAnalyzerRouter = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = new Set([
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ]);
        const allowedExtensions = /\.(pdf|docx|txt)$/i;

        if (allowedMimeTypes.has(file.mimetype) || allowedExtensions.test(file.originalname || "")) {
            cb(null, true);
            return;
        }

        cb(new Error("Only PDF, DOCX, or TXT resume files are supported."));
    },
});

const handleUploadError = (err, req, res, next) => {
    if (!err) {
        next();
        return;
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Resume file must be 5MB or smaller." });
    }

    return res.status(400).json({ message: err.message || "Unable to upload resume file." });
};

resumeAnalyzerRouter.post("/analyze", authMiddleware, upload.single("resume"), handleUploadError, analyzeResume);
resumeAnalyzerRouter.get("/history", authMiddleware, getResumeAnalysisHistory);
resumeAnalyzerRouter.get("/history/:id", authMiddleware, getResumeAnalysisById);
resumeAnalyzerRouter.delete("/history/:id", authMiddleware, deleteResumeAnalysis);

export default resumeAnalyzerRouter;
