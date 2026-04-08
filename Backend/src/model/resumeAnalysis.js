import mongoose from "mongoose";

const { Schema } = mongoose;

const courseRecommendationSchema = new Schema(
    {
        title: { type: String, trim: true },
        reason: { type: String, trim: true },
    },
    { _id: false }
);

const jobMatchSchema = new Schema(
    {
        score: { type: Number, min: 0, max: 100, default: 0 },
        summary: { type: String, trim: true, default: "" },
        requirementsMet: { type: [String], default: [] },
        requirementsMissing: { type: [String], default: [] },
    },
    { _id: false }
);

const sectionFeedbackSchema = new Schema(
    {
        section: { type: String, trim: true },
        feedback: { type: String, trim: true },
    },
    { _id: false }
);

const resumeAnalysisSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true,
        },
        candidateName: { type: String, trim: true, default: "" },
        fileName: { type: String, trim: true, default: "" },
        targetRole: { type: String, trim: true, default: "" },
        jobDescription: { type: String, trim: true, default: "" },
        resumeTextPreview: { type: String, default: "" },
        summary: { type: String, trim: true, default: "" },
        improvedSummary: { type: String, trim: true, default: "" },
        resumeScore: { type: Number, min: 0, max: 100, default: 0 },
        atsScore: { type: Number, min: 0, max: 100, default: 0 },
        keywordMatchScore: { type: Number, min: 0, max: 100, default: 0 },
        formatScore: { type: Number, min: 0, max: 100, default: 0 },
        sectionScore: { type: Number, min: 0, max: 100, default: 0 },
        strengths: { type: [String], default: [] },
        weaknesses: { type: [String], default: [] },
        missingSkills: { type: [String], default: [] },
        recommendations: { type: [String], default: [] },
        atsKeywords: { type: [String], default: [] },
        courseRecommendations: { type: [courseRecommendationSchema], default: [] },
        roleAlignment: { type: String, trim: true, default: "" },
        jobMatch: { type: jobMatchSchema, default: () => ({}) },
        sectionFeedback: { type: [sectionFeedbackSchema], default: [] },
        fullAnalysis: { type: String, trim: true, default: "" },
        modelUsed: { type: String, trim: true, default: "" },
    },
    { timestamps: true }
);

resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

const ResumeAnalysis = mongoose.model("resumeAnalysis", resumeAnalysisSchema);

export default ResumeAnalysis;
