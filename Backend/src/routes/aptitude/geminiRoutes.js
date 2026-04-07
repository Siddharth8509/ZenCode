import express from 'express';
import { generateQuestions } from '../../controllers/aptitude/geminiController.js';

const router = express.Router();

router.get('/generate', generateQuestions);

export default router;
