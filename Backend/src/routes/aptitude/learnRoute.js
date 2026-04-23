import express from 'express';
import { 
    addLecture, 
    getLectures, 
    updateLecture, 
    deleteLecture,
    getLearningProgress,
    updateLearningProgress,
} from '../../controllers/aptitude/learnController.js';
import adminMiddleware from '../../middleware/admin.middleware.js';

const router = express.Router();

router.get('/progress/:courseType', getLearningProgress);
router.put('/progress/:courseType', updateLearningProgress);

router.get('/', getLectures);

router.post('/', adminMiddleware, addLecture);
router.put('/:id', adminMiddleware, updateLecture);
router.delete('/:id', adminMiddleware, deleteLecture);

export default router;
