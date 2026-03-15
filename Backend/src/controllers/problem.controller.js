// Problem controller is the backend brain for authoring and browsing practice questions.
// It handles admin CRUD, problem detail reads, and user progress summaries.
import { getLanguageId, submitBatch, submitToken } from "../utils/problem.utils.js";
import mongoose from "mongoose";
import problem from "../model/problem.js";
import user from "../model/user.js"
import submission from "../model/submission.js";


const createProblem = async (req, res) => {
    try {
        const {
            title, difficulty, tags, companies,
            description, examples, visibleTestCase,
            hiddenTestCase, initialCode,
            referenceSolution, testCases, editorial
        } = req.body;

        // The admin form sends a friendly `testCases` array, so we normalize it into the shape the judge expects.
        const finalVisibleTestCase = visibleTestCase || (testCases || []).map(tc => ({
            input: tc.input,
            output: (tc.expectedOutput || tc.output || "").trim()
        }));
        const finalHiddenTestCase = hiddenTestCase || finalVisibleTestCase;

        // Reference solutions are treated as a safety net:
        // if an admin includes them, we verify they really pass before saving the problem.
        if (referenceSolution && referenceSolution.length > 0 && finalVisibleTestCase.length > 0) {
            for (const { language, solution } of referenceSolution) {
                const languageId = getLanguageId(language);
                if (!languageId) {
                    return res.status(400).send(`Unsupported reference solution language: ${language}`);
                }

                const submission = finalVisibleTestCase.map(({ input, output }) => ({
                    source_code: solution,
                    language_id: languageId,
                    stdin: input,
                    expected_output: (output || "").trim()
                }));

                const submitResult = await submitBatch(submission);
                if (!submitResult?.length) {
                    return res.status(500).send("Judge submission failed");
                }

                const tokens = submitResult.map(s => s.token);
                const testResults = await submitToken(tokens);

                for (const test of testResults) {
                    if (test.status_id === 3) continue;
                    if (test.status_id === 4) return res.status(406).send("Wrong Answer");
                    if (test.status_id === 5) return res.status(406).send("Time Limit Exceeded");
                    if (test.status_id === 6) return res.status(406).send("Compilation Error");
                    return res.status(406).send("Runtime Error");
                }
            }
        }

        await problem.create({
            title,
            difficulty,
            tags: Array.isArray(tags) ? tags : [tags],
            companies: Array.isArray(companies) ? companies : (companies || "").split(",").map(c => c.trim()).filter(Boolean),
            description,
            examples,
            visibleTestCase: finalVisibleTestCase,
            hiddenTestCase: finalHiddenTestCase,
            initialCode,
            referenceSolution: referenceSolution || [],
            editorial: editorial || "",
            problemCreator: req.userId,
        });
        return res.status(201).send("Problem created successfully");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error: " + error.message);
    }
};

const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).send("Problem id is required");


        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send("Invalid problem id");

        const problemDoc = await problem.findById(id);
        if (!problemDoc)
            return res.status(404).send("Problem does not exist");


        return res.status(200).json({
            _id: problemDoc._id,
            problemId: problemDoc._id,
            title: problemDoc.title,
            description: problemDoc.description,
            examples: problemDoc.examples,
            difficulty: problemDoc.difficulty,
            tags: problemDoc.tags,
            companies: problemDoc.companies,
            initialCode: problemDoc.initialCode,
            referenceSolution: problemDoc.referenceSolution,
            visibleTestCase: problemDoc.visibleTestCase,
            editorial: problemDoc.editorial
        });
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
};

const problemFetchAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const problemlimit = 5;

        const problemskip = (page - 1) * problemlimit;

        // The problem list stays intentionally lean because the frontend only needs summary cards here.
        const problems = await problem.find({}).select("title _id difficulty tags ").skip(problemskip).limit(problemlimit);

        const totalProblems = await problem.countDocuments();

        return res.status(200).json({
            problems,
            currentPage: page,
            totalPages: Math.ceil(totalProblems / problemlimit),
            hasMore: page < Math.ceil(totalProblems / problemlimit)
        });

    }
    catch (error) {
        res.status(500).send("Error while fetching data")
    }
}

const updateProblem = async (req, res) => {
    const {
        title, difficulty, tags, companies,
        discription, examples, visibleTestCase,
        hiddenTestCase, initialCode, problemCreator,
        referenceSolution
    } = req.body;
    const data = req.body;
    const { id } = req.params;
    try {

        if (Object.keys(data).length === 0)
            return res.status(400).send("Please enter data to update");

        if (!id)
            return res.status(400).send("Please send the id of the problem")

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send("Please enter a valid id")

        const findProblem = await problem.findById(id);
        if (!findProblem)
            return res.status(404).send("Problem does not exist")

        if (referenceSolution && visibleTestCase) {
            for (const { language, solution } of referenceSolution) {
                const languageId = getLanguageId(language);
                if (!languageId) {
                    return res.status(400).send(`Unsupported reference solution language: ${language}`);
                }

                const submission = visibleTestCase.map(({ input, output }) => ({
                    source_code: solution,
                    language_id: languageId,
                    stdin: input,
                    expected_output: output
                }))

                const submitResult = await submitBatch(submission);
                const resultToken = submitResult.map((value) => value.token)
                const testResults = await submitToken(resultToken);

                for (const test of testResults) {
                    if (test.status_id === 3)
                        continue;

                    if (test.status_id === 4)
                        return res.status(406).send("Wrong Answer");

                    if (test.status_id === 5)
                        return res.status(406).send("Time Limit Exceeded");

                    if (test.status_id === 6)
                        return res.status(406).send("Compilation Error");

                    return res.status(406).send("Runtime Error");
                }
            }
        }
        await problem.findByIdAndUpdate(id, data, { runValidators: true, new: true });
        res.status(200).send("Problem updated successfully");
    }
    catch (error) {
        res.status(500).send("Error occured while updating" + error.message);
    }
}

const solvedProblemByUser = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).send("Unauthorized");

        if (!mongoose.Types.ObjectId.isValid(userId))
            return res.status(400).send("Invalid user id");


        const userData = await user.findById(userId).populate("problemSolved", "title _id difficulty tags");

        if (!userData)
            return res.status(404).send("User not found");

        const solvedCount = userData.problemSolved.length;
        const totalProblems = await problem.countDocuments();
        const progressPercent = totalProblems
            ? Math.round((solvedCount / totalProblems) * 100)
            : 0;

        // Recent solves are built from submissions instead of `problemSolved`
        // so we can keep the timestamps of when a question was last cleared.
        const recentSolvedRaw = await submission.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    status: "accepted"
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$problemId",
                    solvedAt: { $first: "$createdAt" }
                }
            },
            { $sort: { solvedAt: -1 } },
            { $limit: 5 }
        ]);

        const recentSolvedProblemIds = recentSolvedRaw.map((entry) => entry._id);
        const recentSolvedProblemDocs = await problem
            .find({ _id: { $in: recentSolvedProblemIds } })
            .select("title");

        const titleByProblemId = new Map(
            recentSolvedProblemDocs.map((doc) => [doc._id.toString(), doc.title || "Untitled Problem"])
        );

        const recentSolved = recentSolvedRaw.map((entry) => ({
            problemId: entry._id.toString(),
            title: titleByProblemId.get(entry._id.toString()) || "Untitled Problem",
            solvedAt: entry.solvedAt
        }));

        return res.status(200).json({
            solvedCount,
            totalProblems,
            progressPercent,
            problems: userData.problemSolved,
            recentSolved
        });
    }
    catch (error) {
        return res.status(500).send("Failed to fetch data");
    }
}

const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).send("Please enter a valid id");

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send("Invalid id")

        const existingProblem = await problem.findById(id);
        if (!existingProblem)
            return res.status(404).send("The problem does not exist")

        const deletedProblem = await problem.findByIdAndDelete(id);
        return res.status(200).send("Problem deleted successfully");
    }
    catch (error) {
        return res.status(500).send("An error occured while deleting the problem");
    }
}

const getSubmission = async (req, res) => {
    try {
        const userId = req.userId;
        const problemId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).send("Invalid problemId");
        }

        const submissionsDone = await submission.find({ userId, problemId });
        if (submissionsDone.length == 0)
            return res.status(200).send("No submission for this problem");

        return res.status(200).send(submissionsDone);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

const cleanupOrphanedData = async (req, res) => {
    try {
        // Clear all users' problemSolved arrays
        await user.updateMany({}, { $set: { problemSolved: [] } });
        // Delete all submissions
        await submission.deleteMany({});
        return res.status(200).json({ message: "Cleanup complete. All problemSolved arrays cleared, all submissions deleted." });
    } catch (error) {
        console.error("Cleanup error:", error);
        return res.status(500).send("Cleanup failed: " + error.message);
    }
};

export { createProblem, getProblemById, problemFetchAll, updateProblem, solvedProblemByUser, deleteProblem, getSubmission, cleanupOrphanedData };
