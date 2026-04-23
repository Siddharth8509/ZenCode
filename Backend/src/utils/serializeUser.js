const serializeLearningCourseProgress = (progressEntry) => ({
    watchedVideoIds: Array.isArray(progressEntry?.watchedVideoIds) ? progressEntry.watchedVideoIds : [],
    lastWatchedVideoId: progressEntry?.lastWatchedVideoId || "",
    lastWatchedTopic: progressEntry?.lastWatchedTopic || "",
    updatedAt: progressEntry?.updatedAt || null,
});

const serializeUser = (userDoc) => ({
    _id: userDoc._id,
    firstname: userDoc.firstname,
    lastname: userDoc.lastname,
    age: userDoc.age,
    gender: userDoc.gender,
    emailId: userDoc.emailId,
    role: userDoc.role,
    profilePic: userDoc.profilePic || "",
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
    aptitudeLearningProgress: {
        aptitude: serializeLearningCourseProgress(userDoc.aptitudeLearningProgress?.aptitude),
        logical: serializeLearningCourseProgress(userDoc.aptitudeLearningProgress?.logical),
        verbal: serializeLearningCourseProgress(userDoc.aptitudeLearningProgress?.verbal),
        csCore: serializeLearningCourseProgress(userDoc.aptitudeLearningProgress?.csCore),
    },
});

export default serializeUser;
