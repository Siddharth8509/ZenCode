import { Learn } from '../../model/aptitude/learnModel.js';
import User from '../../model/user.js';

const COURSE_TYPE_TO_KEY = {
    aptitude: 'aptitude',
    logical: 'logical',
    verbal: 'verbal',
    'cs-core': 'csCore',
};

const createEmptyProgress = () => ({
    watchedVideoIds: [],
    lastWatchedVideoId: '',
    lastWatchedTopic: '',
    updatedAt: null,
});

const normalizeProgressEntry = (progressEntry) => ({
    watchedVideoIds: Array.isArray(progressEntry?.watchedVideoIds) ? progressEntry.watchedVideoIds : [],
    lastWatchedVideoId: progressEntry?.lastWatchedVideoId || '',
    lastWatchedTopic: progressEntry?.lastWatchedTopic || '',
    updatedAt: progressEntry?.updatedAt || null,
});

const getCourseKey = (courseType) => COURSE_TYPE_TO_KEY[courseType] || null;

// @desc    Add a new video lecture
// @route   POST /api/learn
export const addLecture = async (req, res) => {
    try {
        const { topic, category, videoUrl, description, duration } = req.body;

        // Validation check for Vercel stability
        if (!topic || !videoUrl) {
            return res.status(400).json({ message: "Topic and Video URL are required" });
        }

        const lecture = await Learn.create({
            topic,
            category,
            videoUrl,
            description,
            duration
        });

        res.status(201).json(lecture);
    } catch (error) {
        console.error("Add Lecture Error:", error.message);
        res.status(500).json({ message: "Server Error: Could not add lecture", error: error.message });
    }
};

// @desc    Get all video lectures
// @route   GET /api/learn
export const getLectures = async (req, res) => {
    try {
        // Use lean() for faster performance in serverless functions
        const lectures = await Learn.find({}).lean().sort({ createdAt: -1 });
        res.status(200).json(lectures);
    } catch (error) {
        console.error("Get Lectures Error:", error.message);
        res.status(500).json({ message: "Server Error: Could not fetch lectures", error: error.message });
    }
};

// @desc    Update a lecture
// @route   PUT /api/learn/:id
export const updateLecture = async (req, res) => {
    try {
        const updatedLecture = await Learn.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // runValidators ensures the update follows schema rules
        );

        if (!updatedLecture) {
            return res.status(404).json({ message: "Lecture not found" });
        }

        res.status(200).json(updatedLecture);
    } catch (error) {
        console.error("Update Lecture Error:", error.message);
        res.status(400).json({ message: "Invalid update data", error: error.message });
    }
};

// @desc    Delete a lecture
// @route   DELETE /api/learn/:id
export const deleteLecture = async (req, res) => {
    try {
        const deletedLecture = await Learn.findByIdAndDelete(req.params.id);

        if (!deletedLecture) {
            return res.status(404).json({ message: "Lecture not found" });
        }

        res.status(200).json({ message: "Lecture deleted successfully" });
    } catch (error) {
        console.error("Delete Lecture Error:", error.message);
        res.status(500).json({ message: "Could not delete lecture", error: error.message });
    }
};

// @desc    Get saved aptitude learning progress for the logged-in user
// @route   GET /aptitude/learn/progress
export const getLearningProgress = async (req, res) => {
    try {
        const courseType = req.params.courseType || req.query.courseType;
        const courseKey = getCourseKey(courseType);

        if (!courseKey) {
            return res.status(400).json({ message: "Invalid course type" });
        }

        const userDoc = await User.findById(req.userId).select('aptitudeLearningProgress').lean();

        if (!userDoc) {
            return res.status(404).json({ message: "User not found" });
        }

        const progress = normalizeProgressEntry(userDoc.aptitudeLearningProgress?.[courseKey]);

        res.status(200).json({
            success: true,
            courseType,
            progress,
        });
    } catch (error) {
        console.error("Get Learning Progress Error:", error.message);
        res.status(500).json({ message: "Could not fetch learning progress", error: error.message });
    }
};

// @desc    Save aptitude learning progress for the logged-in user
// @route   PUT /aptitude/learn/progress
export const updateLearningProgress = async (req, res) => {
    try {
        const { videoId, topicTitle } = req.body || {};
        const courseType = req.params.courseType || req.body?.courseType;
        const courseKey = getCourseKey(courseType);

        if (!courseKey) {
            return res.status(400).json({ message: "Invalid course type" });
        }

        if (!videoId || typeof videoId !== 'string') {
            return res.status(400).json({ message: "A valid video ID is required" });
        }

        const userDoc = await User.findById(req.userId).select('aptitudeLearningProgress');

        if (!userDoc) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingProgress = normalizeProgressEntry(userDoc.aptitudeLearningProgress?.[courseKey] || createEmptyProgress());
        const watchedVideoIds = Array.from(new Set([...existingProgress.watchedVideoIds, videoId]));

        userDoc.aptitudeLearningProgress[courseKey] = {
            watchedVideoIds,
            lastWatchedVideoId: videoId,
            lastWatchedTopic: typeof topicTitle === 'string' ? topicTitle : existingProgress.lastWatchedTopic,
            updatedAt: new Date(),
        };

        await userDoc.save();

        res.status(200).json({
            success: true,
            courseType,
            progress: normalizeProgressEntry(userDoc.aptitudeLearningProgress[courseKey]),
        });
    } catch (error) {
        console.error("Update Learning Progress Error:", error.message);
        res.status(500).json({ message: "Could not save learning progress", error: error.message });
    }
};
