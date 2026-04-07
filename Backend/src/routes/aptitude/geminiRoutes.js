import express from 'express';
import { generateQuestions } from '../../controllers/aptitude/geminiController.js';

const router = express.Router();

router.post('/generate', generateQuestions);
router.get('/generate', generateQuestions);

export default router;
