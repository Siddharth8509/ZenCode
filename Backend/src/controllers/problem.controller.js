import { getLanguageId, executeCodeAndEvaluate } from "../utils/problem.utils.js";
import mongoose from "mongoose";
import problem from "../model/problem.js";
import user from "../model/user.js"
import submission from "../model/submission.js";

/**
 * Validates and creates a new problem in the database.
 * If a reference solution is provided, it is first evaluated against the
 * visible test cases via Judge0 to guarantee accuracy before saving the problem.
 */
const createProblem = async (req, res) => {
    try {
        const {
            title, difficulty, tags, companies,
            description, examples, visibleTestCase,
            hiddenTestCase, initialCode,
            referenceSolution
        } = req.body;

        if (referenceSolution && referenceSolution.length > 0 && visibleTestCase && visibleTestCase.length > 0) {
            for (const { language, solution } of referenceSolution) {
                const languageId = getLanguageId(language);

                // We simulate the output.trim() behavior inside the helper, or we can format it here.
                const formattedTestCases = visibleTestCase.map(({ input, output }) => ({
                    input,
                    output: output.trim() // 🔥 FIX 1
                }));

                const testResults = await executeCodeAndEvaluate(solution, languageId, formattedTestCases);

                for (const test of testResults) {
                    console.log({
                        stdin: test.input,
                        expected: test.expectedOutput,
                        stdout: test.actualOutput,
                        status: test.status
                    });

                    if (test.raw_status_id === 3) continue;
                    if (test.raw_status_id === 4) return res.status(406).send("Wrong Answer");
                    if (test.raw_status_id === 5) return res.status(406).send("Time Limit Exceeded");
                    if (test.raw_status_id === 6) return res.status(406).send("Compilation Error");

                    return res.status(406).send("Runtime Error");
                }
            }
        }

        await problem.create({ ...req.body, problemCreator: req.userId });
        return res.status(201).send("Problem created successfully");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};

/**
 * Fetches the full details of a specific problem by its ID.
 * Used primarily for the main problem-solving page.
 */
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

/**
 * Fetches a paginated list of problems for the catalog dashboard.
 * Returns lightweight data (title, difficulty, tags) to keep the list fast.
 */
const problemFetchAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const problemlimit = 15;

        const problemskip = (page - 1) * problemlimit;

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

/**
 * Validates and updates an existing problem.
 * Re-validates the reference solution via Judge0 if it or the test cases are modified.
 */
const updateProblem = async (req, res) => {
    const {
        title, difficulty, tags, companies,
        description, examples, visibleTestCase,
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

                const testResults = await executeCodeAndEvaluate(solution, languageId, visibleTestCase);

                for (const test of testResults) {
                    if (test.raw_status_id === 3)
                        continue;

                    if (test.raw_status_id === 4)
                        return res.status(406).send("Wrong Answer");

                    if (test.raw_status_id === 5)
                        return res.status(406).send("Time Limit Exceeded");

                    if (test.raw_status_id === 6)
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

/**
 * Returns the list of problems that the authenticated user has successfully solved.
 * Used for building statistics on the profile dashboard.
 */
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

        const totalProblemsCount = await problem.countDocuments();

        // Map problems to match what frontend expects for recentSolved
        const mappedProblems = userData.problemSolved.map(p => ({
            problemId: p._id,
            title: p.title,
            solvedAt: new Date() // Since user.problemSolved doesn't store timestamps, we just pass something or omit it
        }));

        return res.status(200).json({ 
            solvedCount: userData.problemSolved.length, 
            totalProblems: totalProblemsCount,
            recentSolved: mappedProblems.reverse() // latest first
        });
    }
    catch (error) {
        return res.status(500).send("Failed to fetch data");
    }
}

/**
 * Deletes a specific problem by ID (Admin only).
 */
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

/**
 * Gets submission history for a specific problem for the currently logged in user.
 */
const getSubmission = async (req, res) => {
    try {
        const userId = req.userId;
        const problemId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ message: "Invalid problemId" });
        }

        const submissionsDone = await submission
            .find({ userId, problemId })
            .sort({ createdAt: -1 });

        return res.status(200).send(submissionsDone);
    }
    catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * Gets daily activity data for a user (count of accepted submissions per day).
 */
const getUserActivity = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).send("Unauthorized");

        if (!mongoose.Types.ObjectId.isValid(userId))
            return res.status(400).send("Invalid user id");

        const activity = await submission.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), status: "accepted" } },
            { 
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json(activity);
    } catch (error) {
        console.error("Activity Error:", error);
        return res.status(500).send("Failed to fetch activity");
    }
};

export { createProblem, getProblemById, problemFetchAll, updateProblem, solvedProblemByUser, deleteProblem, getSubmission, getUserActivity };
