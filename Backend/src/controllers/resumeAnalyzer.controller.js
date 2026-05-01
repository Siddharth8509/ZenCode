import { getGeminiClient, GEMINI_MODEL as BASE_MODEL, GEMINI_API_KEY } from "../config/ai.js";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import mongoose from "mongoose";
import ResumeAnalysis from "../model/resumeAnalysis.js";

const GEMINI_MODEL = BASE_MODEL;
const MAX_RESUME_CHARS = 18000;
const MAX_JOB_DESCRIPTION_CHARS = 6000;

function truncateText(value, maxLength) {
    const text = String(value || "").replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}\n\n[Truncated for analysis]`;
}

function toStringArray(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => {
            if (typeof item === "string") return item.trim();
            if (item && typeof item === "object") return String(item.text || item.value || item.title || "").trim();
            return "";
        })
        .filter(Boolean)
        .slice(0, 12);
}

function clampScore(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return 0;
    return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function parseGeminiJson(text) {
    const cleanedText = String(text || "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleanedText);
    } catch (error) {
        const objectStart = cleanedText.indexOf("{");
        const objectEnd = cleanedText.lastIndexOf("}");

        if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
            return JSON.parse(cleanedText.slice(objectStart, objectEnd + 1));
        }

        throw error;
    }
}

async function extractTextFromPdf(buffer) {
    const result = await pdfParse(buffer);
    return result.text || "";
}

async function extractResumeText(file) {
    if (!file?.buffer) {
        throw new Error("Resume file is required.");
    }

    if (file.mimetype === "application/pdf" || file.originalname?.toLowerCase().endsWith(".pdf")) {
        return extractTextFromPdf(file.buffer);
    }

    if (
        file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.originalname?.toLowerCase().endsWith(".docx")
    ) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        return result.value || "";
    }

    if (file.mimetype?.startsWith("text/") || file.originalname?.toLowerCase().endsWith(".txt")) {
        return file.buffer.toString("utf8");
    }

    throw new Error("Unsupported resume file type. Upload a PDF, DOCX, or TXT file.");
}

function normalizeCourseRecommendations(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => {
            if (typeof item === "string") return { title: item.trim(), reason: "" };
            return {
                title: String(item?.title || item?.name || "").trim(),
                reason: String(item?.reason || item?.why || "").trim(),
            };
        })
        .filter((item) => item.title)
        .slice(0, 8);
}

function normalizeSectionFeedback(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => ({
            section: String(item?.section || item?.title || "").trim(),
            feedback: String(item?.feedback || item?.recommendation || item?.text || "").trim(),
        }))
        .filter((item) => item.section && item.feedback)
        .slice(0, 10);
}

function normalizeAnalysisPayload(payload, modelUsed) {
    const jobMatch = payload?.jobMatch || {};

    return {
        summary: String(payload?.summary || "").trim(),
        improvedSummary: String(payload?.improvedSummary || "").trim(),
        resumeScore: clampScore(payload?.resumeScore),
        atsScore: clampScore(payload?.atsScore),
        keywordMatchScore: clampScore(payload?.keywordMatchScore),
        formatScore: clampScore(payload?.formatScore),
        sectionScore: clampScore(payload?.sectionScore),
        strengths: toStringArray(payload?.strengths),
        weaknesses: toStringArray(payload?.weaknesses),
        missingSkills: toStringArray(payload?.missingSkills),
        recommendations: toStringArray(payload?.recommendations),
        atsKeywords: toStringArray(payload?.atsKeywords),
        courseRecommendations: normalizeCourseRecommendations(payload?.courseRecommendations),
        roleAlignment: String(payload?.roleAlignment || "").trim(),
        jobMatch: {
            score: clampScore(jobMatch.score),
            summary: String(jobMatch.summary || "").trim(),
            requirementsMet: toStringArray(jobMatch.requirementsMet),
            requirementsMissing: toStringArray(jobMatch.requirementsMissing),
        },
        sectionFeedback: normalizeSectionFeedback(payload?.sectionFeedback),
        fullAnalysis: String(payload?.fullAnalysis || "").trim(),
        modelUsed,
    };
}

function buildAnalysisPrompt({ resumeText, targetRole, jobDescription }) {
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return `
You are an expert resume analyst and ATS optimization specialist.
The current date is ${currentDate}. Keep this in mind when evaluating resume timelines, "current" roles, and past vs. future dates.

Analyze the resume for clarity, impact, ATS compatibility, role alignment, missing skills, formatting, and practical next steps.
Return only valid JSON. Do not include markdown fences or commentary outside JSON.

JSON schema:
{
  "summary": "short overall assessment",
  "resumeScore": 0,
  "atsScore": 0,
  "keywordMatchScore": 0,
  "formatScore": 0,
  "sectionScore": 0,
  "strengths": ["5-7 specific strengths"],
  "weaknesses": ["5-7 specific weaknesses"],
  "missingSkills": ["specific missing skills or keywords"],
  "recommendations": ["actionable resume improvements"],
  "atsKeywords": ["keywords to add for ATS"],
  "courseRecommendations": [{ "title": "course or certification", "reason": "why it helps" }],
  "roleAlignment": "how well the resume aligns with the target role",
  "jobMatch": {
    "score": 0,
    "summary": "only if a job description is provided; otherwise explain target role fit",
    "requirementsMet": ["matched requirements"],
    "requirementsMissing": ["missing job description requirements"]
  },
  "sectionFeedback": [{ "section": "Experience", "feedback": "specific feedback" }],
  "improvedSummary": "a stronger resume summary the user can paste",
  "fullAnalysis": "detailed but concise report in plain text"
}

Scoring rules:
- Scores must be integers from 0 to 100.
- Be strict but constructive.
- If the resume is thin, incomplete, or generic, score accordingly.
- Avoid inventing experience not present in the resume.

Target role: ${targetRole || "Not specified"}

Job description:
${jobDescription || "Not provided"}

Resume:
${resumeText}
`;
}

async function analyzeWithGemini({ resumeText, targetRole, jobDescription }) {
    if (!GEMINI_API_KEY) {
        const error = new Error("AI is not configured. Set GEMINI_API_KEY in the backend .env file.");
        error.statusCode = 503;
        throw error;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: buildAnalysisPrompt({ resumeText, targetRole, jobDescription }) }] }],
        config: {
            responseMimeType: "application/json",
            temperature: 0.25,
            maxOutputTokens: 8192,
        },
    });

    return normalizeAnalysisPayload(parseGeminiJson(response.text), GEMINI_MODEL);
}

const analyzeResume = async (req, res) => {
    try {
        const userId = req.userId;
        const candidateName = String(req.body?.candidateName || "").trim();
        const targetRole = String(req.body?.targetRole || "").trim();
        const jobDescription = truncateText(req.body?.jobDescription || "", MAX_JOB_DESCRIPTION_CHARS);

        if (!req.file) {
            return res.status(400).json({ message: "Please upload a resume file." });
        }

        const extractedText = truncateText(await extractResumeText(req.file), MAX_RESUME_CHARS);

        if (!extractedText || extractedText.length < 80) {
            return res.status(422).json({
                message: "Could not extract enough text from this resume. Try a text-based PDF, DOCX, or TXT file.",
            });
        }

        const analysisPayload = await analyzeWithGemini({
            resumeText: extractedText,
            targetRole,
            jobDescription,
        });

        const analysis = await ResumeAnalysis.create({
            ...analysisPayload,
            userId,
            candidateName,
            fileName: req.file.originalname || "",
            targetRole,
            jobDescription,
            resumeTextPreview: extractedText.slice(0, 1200),
        });

        return res.status(201).json({ message: "Resume analyzed successfully.", analysis });
    } catch (error) {
        console.error("Resume analyzer error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.message || "Unable to analyze resume right now.",
        });
    }
};

const getResumeAnalysisHistory = async (req, res) => {
    try {
        const history = await ResumeAnalysis.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .select("-resumeTextPreview -jobDescription -fullAnalysis");

        return res.status(200).json({ history });
    } catch (error) {
        return res.status(500).json({ message: "Unable to load resume analysis history." });
    }
};

const getResumeAnalysisById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid analysis id." });
        }

        const analysis = await ResumeAnalysis.findOne({ _id: req.params.id, userId: req.userId });
        if (!analysis) {
            return res.status(404).json({ message: "Resume analysis not found." });
        }

        return res.status(200).json({ analysis });
    } catch (error) {
        return res.status(500).json({ message: "Unable to load resume analysis." });
    }
};

const deleteResumeAnalysis = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid analysis id." });
        }

        const analysis = await ResumeAnalysis.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!analysis) {
            return res.status(404).json({ message: "Resume analysis not found." });
        }

        return res.status(200).json({ message: "Resume analysis deleted." });
    } catch (error) {
        return res.status(500).json({ message: "Unable to delete resume analysis." });
    }
};

export { analyzeResume, getResumeAnalysisHistory, getResumeAnalysisById, deleteResumeAnalysis };
