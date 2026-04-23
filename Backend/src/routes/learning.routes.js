import express from 'express';
import { LearningPdf } from '../model/LearningPdf.model.js';
import adminMiddleware from '../middleware/admin.middleware.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();
const VALID_SUBJECTS = new Set(['OS', 'DBMS', 'CN', 'Other']);

// Explicit JSON parser for this router
router.use(express.json());

function isConfiguredForCloudinary() {
    return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
}

function isValidHttpUrl(value) {
    try {
        const parsedUrl = new URL(value);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
}

router.get('/pdfs/sign', adminMiddleware, async (req, res) => {
    try {
        if (!isConfiguredForCloudinary()) {
            return res.status(500).json({
                success: false,
                message: "Cloudinary upload is not configured on the server.",
            });
        }

        const folder = typeof req.query.folder === 'string' && req.query.folder.trim()
            ? req.query.folder.trim()
            : 'learning_pdfs';
        const timestamp = Math.round(Date.now() / 1000);
        const paramsToSign = { timestamp, folder };
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        res.status(200).json({
            success: true,
            signature,
            timestamp,
            folder,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
        });
    } catch (error) {
        console.error("Learning PDF Signature Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET all PDFs
router.get('/pdfs', async (req, res) => {
    try {
        const { subject } = req.query;
        const filter = VALID_SUBJECTS.has(subject) ? { subject } : {};
        const pdfs = await LearningPdf.find(filter).sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, pdfs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - save a PDF record (file is uploaded client-side to Cloudinary)
router.post('/pdfs', adminMiddleware, async (req, res) => {
    try {
        const { title, subject, pdfUrl } = req.body || {};
        const normalizedTitle = typeof title === 'string' ? title.trim() : '';
        const normalizedSubject = VALID_SUBJECTS.has(subject) ? subject : 'Other';
        const normalizedPdfUrl = typeof pdfUrl === 'string' ? pdfUrl.trim() : '';

        if (!normalizedTitle) {
            return res.status(400).json({ success: false, message: "PDF title is required." });
        }

        if (!normalizedPdfUrl) {
            return res.status(400).json({ success: false, message: "No PDF URL provided." });
        }

        if (!isValidHttpUrl(normalizedPdfUrl)) {
            return res.status(400).json({ success: false, message: "Please provide a valid PDF URL." });
        }

        const newPdf = new LearningPdf({
            title: normalizedTitle,
            subject: normalizedSubject,
            pdfUrl: normalizedPdfUrl,
            uploadedBy: req.userId || null
        });

        await newPdf.save();
        res.status(201).json({
            success: true,
            message: "Learning PDF added successfully!",
            pdf: newPdf
        });
    } catch (error) {
        console.error("Learning PDF Save Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE a PDF
router.delete('/pdfs/:id', adminMiddleware, async (req, res) => {
    try {
        await LearningPdf.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "PDF Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
