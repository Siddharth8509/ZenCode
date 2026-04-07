import express from 'express';
import { uploadPdfFile, getPdfs, deletePdf, getPdfById, updatePdf } from '../../controllers/aptitude/pdfController.js';
import upload from '../../middleware/upload.js'; // Universal middleware use kar rahe hain
import adminMiddleware from '../../middleware/admin.middleware.js';

const router = express.Router();

// 'pdfFile' field name frontend se match hona chahiye
router.post('/upload', adminMiddleware, upload.single('pdfFile'), uploadPdfFile);
router.get('/', getPdfs);
router.get('/:id', getPdfById); // Naya route
router.put('/:id', adminMiddleware, upload.single('pdfFile'), updatePdf);
router.delete('/:id', adminMiddleware, deletePdf);

export default router;