import {getLanguageId,submitBatch,submitToken} from "../utils/problem.utils.js";
import mongoose from "mongoose";
import problem from "../model/problem.js";
import user from "../model/user.js";
import submission from "../model/submission.js"

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

const submitCode = async(req,res) => {
    try
    {
        const userId = req.userId;
        const problemId = req.params.id;
        const {code,language} = req.body;
        if(!userId || !problemId || !code || !language)
            return res.status(400).send("Please enter all valid fields");
        if (!mongoose.Types.ObjectId.isValid(problemId)) 
            return res.status(400).send("Invalid problem id format");

        const userInfo = await user.findById(userId);
        if (!userInfo)
            return res.status(401).send("Invalid user");

        const problemData = await problem.findById(problemId);
        if(!problemData)
            return res.status(404).send("Invalid problemId");

        const submitedProblem = await submission.create({
            userId : userId,
            problemId : problemId,
            code : code,
            language : language,
            status : "pending",
            testCasesTotal : problemData.hiddenTestCase.length
        });
        const languageId = getLanguageId(language);

        const judgeSubmissions  = problemData.hiddenTestCase.map(({input,output})=>({
            source_code : code,
            language_id : languageId,
            stdin : input,
            expected_output : output
        }))

        const submitResult = await submitBatch(judgeSubmissions);
        const resultToken = submitResult.map((value)=>value.token)
        const testResults = await submitToken(resultToken);

        let runtime = 0;
        let memory = 0;
        let testCasesPassed = 0;
        let problemStatus = "accepted"
        let errorMessage = null;

        for (const test of testResults) 
        {
            if (test.status_id === 3) 
            {
                testCasesPassed++;
                runtime += parseFloat(test.time) || 0;
                memory = Math.max(memory, test.memory || 0);
            } 
            else 
            {
                errorMessage = test.stderr || test.compile_output || "Execution error";
                problemStatus = mapJudgeStatus(test.status_id);
                break;
            }
        }


        submitedProblem.memory = memory;
        submitedProblem.runtime = runtime;
        submitedProblem.testCasesPassed = testCasesPassed;
        submitedProblem.errorMessage = errorMessage;
        submitedProblem.status = problemStatus;

        if (problemStatus === "accepted") 
        {
            const alreadySolved = userInfo.problemSolved.some(
                (solvedProblemId) => solvedProblemId.toString() === problemData._id.toString()
            );

            if (!alreadySolved) 
            {    
                userInfo.problemSolved.push(problemData._id);
                await userInfo.save();
            }
        }


        await submitedProblem.save();
        res.status(201).json({
            message: "Problem submitted successfully",
            problemStatus,
            runtime,
            memory,
            errorMessage,
            testCasesPassed,
            testCasesTotal: problemData.hiddenTestCase.length,
        });
    }
    catch(error)
    {
        res.status(500).send("Internal server error"+error.message);
    }
}

const runCode = async(req,res) => {
    try
    {
        const userId = req.userId;
        const problemId = req.params.id;
        const {code,language} = req.body;
        if(!userId || !problemId || !code || !language)
            return res.status(400).send("Please enter all valid fields");
        if (!mongoose.Types.ObjectId.isValid(problemId)) 
            return res.status(400).send("Invalid problem id format");

        const userInfo = await user.findById(userId);
        if (!userInfo)
            return res.status(401).send("Invalid user");

        const problemData = await problem.findById(problemId);
        if(!problemData)
            return res.status(404).send("Invalid problemId");

        const languageId = getLanguageId(language);

        const judgeSubmissions  = problemData.visibleTestCase.map(({input,output})=>({
            source_code : code,
            language_id : languageId,
            stdin : input,
            expected_output : output
        }))

        const submitResult = await submitBatch(judgeSubmissions);
        const resultToken = submitResult.map((value)=>value.token)
        const testResults = await submitToken(resultToken);

        let runtime = 0;
        let memory = 0;
        let testCasesPassed = 0;
        let problemStatus = "accepted"
        let errorMessage = null;

        for (const test of testResults) 
        {
            if (test.status_id === 3) 
            {
                testCasesPassed++;
                runtime += parseFloat(test.time) || 0;
                memory = Math.max(memory, test.memory || 0);
            } 
            else 
            {
                errorMessage = test.stderr || test.compile_output || "Execution error";
                problemStatus = mapJudgeStatus(test.status_id);
                break;
            }
        }

        res.status(201).json({ "errorMessage": errorMessage, "runtime": runtime, "problemStatus": problemStatus, "memory": memory });
    } 
    catch(error)
    {
        res.status(500).send("Internal server error"+error.message);
    }
}

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

export  {submitCode,runCode,getSubmission};
