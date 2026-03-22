// Submission API helpers keep page components from repeating request boilerplate.
// They return plain response data so the IDE page can stay focused on UI state.
import axiosClient from "../utils/axiosClient";

/**
 * Submits code to the backend for a quick "run" against visible test cases.
 * This is used for early feedback and does not affect the user's solved progress.
 * @param {string} problemId - The ID of the problem.
 * @param {string} code - The user's editor snapshot.
 * @param {string} language - The selected programming language format.
 * @returns {Promise<Array>} Detailed results for each visible test case.
 */
export const runCodeApi = async (problemId, code, language) => {
    try {
        const response = await axiosClient.post(`/submission/run/${problemId}`, {
            code,
            language,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Submits code to the backend for final evaluation against hidden test cases.
 * This determines if the user has successfully solved the problem.
 * @param {string} problemId - The ID of the problem.
 * @param {string} code - The user's editor snapshot.
 * @param {string} language - The selected programming language format.
 * @returns {Promise<Object>} The status of the submission (e.g., accepted, wrong_answer).
 */
export const submitCodeApi = async (problemId, code, language) => {
    try {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
            code,
            language,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Retrieves the timeline of previous submissions for the current user
 * on the specified problem.
 * @param {string} problemId - The ID of the problem.
 * @returns {Promise<Array>} Array of previous submission records.
 */
export const getSubmissionsApi = async (problemId) => {
    try {
        const response = await axiosClient.get(`/submission/getSubmission/${problemId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}
