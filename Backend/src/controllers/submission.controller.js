import { getLanguageId, executeCodeAndEvaluate } from "../utils/problem.utils.js";
import mongoose from "mongoose";
import problem from "../model/problem.js";
import user from "../model/user.js";
import submission from "../model/submission.js"

/**
 * Maps Judge0 status IDs to a readable string for the database/frontend.
 * 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded, 6 = Compilation Error
 */
const mapJudgeStatus = (statusId) => {
    switch (statusId) {
        case 3:
            return "accepted";
        case 4:
            return "wrong_answer";
        case 5:
            return "time_limit_exceeded";
        case 6:
            return "compilation_error";
        default:
            return "runtime_error";
    }
};

/**
 * Handles full code submissions against ALL hidden test cases.
 * - Extracts code and language from request
 * - Creates a "pending" submission record
 * - Runs the code through Judge0 via helper
 * - Evaluates results (accepts only if all test cases pass)
 * - Updates user's problemSolved list if accepted
 * - Saves and returns the final submission status
 */
const submitCode = async (req, res) => {
    try {
        const userId = req.userId;
        const problemId = req.params.id;
        const { code, language } = req.body;
        if (!userId || !problemId || !code || !language)
            return res.status(400).send("Please enter all valid fields");
        if (!mongoose.Types.ObjectId.isValid(problemId))
            return res.status(400).send("Invalid problem id format");

        const userInfo = await user.findById(userId);
        if (!userInfo)
            return res.status(401).send("Invalid user");

        const problemData = await problem.findById(problemId);
        if (!problemData)
            return res.status(404).send("Invalid problemId");

        const submitedProblem = await submission.create({
            userId: userId,
            problemId: problemId,
            code: code,
            language: language,
            status: "pending",
            testCasesTotal: problemData.hiddenTestCase.length
        });
        const languageId = getLanguageId(language);

        // Uses hidden test cases per user's logic
        const testResults = await executeCodeAndEvaluate(code, languageId, problemData.hiddenTestCase);

        let runtime = 0;
        let memory = 0;
        let testCasesPassed = 0;
        let problemStatus = "accepted"
        let errorMessage = null;

        for (const test of testResults) {
            if (test.raw_status_id === 3) {
                testCasesPassed++;
                runtime += test.time || 0;
                memory = Math.max(memory, test.memory || 0);
            }
            else {
                errorMessage = test.error || "Execution error";
                problemStatus = test.raw_status_id === 4 ? "wrong_answer" : "runtime_error";
                break;
            }
        }


        submitedProblem.memory = memory;
        submitedProblem.runtime = runtime;
        submitedProblem.testCasesPassed = testCasesPassed;
        submitedProblem.errorMessage = errorMessage;
        submitedProblem.status = problemStatus;

        if (!userInfo.problemSolved.includes(problemData._id)) {
            userInfo.problemSolved.push(problemData);
            await userInfo.save();
        }


        await submitedProblem.save();
        res.status(201).json({
            message: "Problem submitted successfully",
            submission: submitedProblem
        });
    }
    catch (error) {
        res.status(500).send("Internal server error" + error.message);
    }
}

/**
 * Handles a quick code "run" against VISIBLE test cases only.
 * - Does NOT create a submission record in the database
 * - Does NOT update user statistics
 * - Returns a detailed array of results for each test case for instant UI feedback
 */
const runCode = async (req, res) => {
    try {
        const userId = req.userId;
        const problemId = req.params.id;
        const { code, language } = req.body;
        if (!userId || !problemId || !code || !language)
            return res.status(400).send("Please enter all valid fields");
        if (!mongoose.Types.ObjectId.isValid(problemId))
            return res.status(400).send("Invalid problem id format");

        const userInfo = await user.findById(userId);
        if (!userInfo)
            return res.status(401).send("Invalid user");

        const problemData = await problem.findById(problemId);
        if (!problemData)
            return res.status(404).send("Invalid problemId");

        const languageId = getLanguageId(language);

        // USE VISIBLE TEST CASES FOR RUN
        const testResults = await executeCodeAndEvaluate(code, languageId, problemData.visibleTestCase);
        
        // Return detailed results as requested by user's logic
        const detailedResults = testResults.map(test => ({
            input: test.input,
            expectedOutput: test.expectedOutput,
            actualOutput: test.actualOutput,
            status: test.status,
            error: test.error,
            statusId: test.raw_status_id,
            time: test.time,
            memory: test.memory
        }));

        res.status(200).json(detailedResults);
    }
    catch (error) {
        res.status(500).send("Internal server error" + error.message);
    }
}

/**
 * Retrieves the submission history for the logged-in user on a specific problem.
 * Sorted descending by creation date.
 */
const getSubmission = async (req, res) => {
    try {
        const userId = req.userId;
        const problemId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).send("Invalid problemId");
        }

        const submissionsDone = await submission.find({ userId, problemId }).sort({ createdAt: -1 });
        return res.status(200).json(submissionsDone);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export { submitCode, runCode, getSubmission };
