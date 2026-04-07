import express from 'express';
import { getQuestions, addQuestion, getQuestionById, updateQuestion, deleteQuestion } from '../../controllers/aptitude/questionController.js';
import upload from '../../middleware/upload.js'; 
import adminMiddleware from '../../middleware/admin.middleware.js';

const router = express.Router();

router.get('/', getQuestions);
router.get('/:id', getQuestionById);

// Admin Dashboard se 'graphImage' bhej rahe ho isliye yahan wahi field name hai
router.post('/add', adminMiddleware, upload.single('graphImage'), addQuestion);
router.put('/:id', adminMiddleware, upload.single('graphImage'), updateQuestion);
router.delete('/:id', adminMiddleware, deleteQuestion);

export default router;