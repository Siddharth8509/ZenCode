// These helpers are the app's bridge to Judge0.
// Controllers call them so submission logic stays about business rules, not HTTP plumbing.
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const readPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Configuration variables defining Judge0 behavior
// Fallbacks are provided if environment variables are missing
const DEFAULT_SUBMIT_RETRIES = readPositiveInt(process.env.JUDGE0_SUBMIT_RETRIES, 3);
const DEFAULT_MAX_POLL_RETRIES = readPositiveInt(process.env.JUDGE0_MAX_POLL_RETRIES, 18);
const INITIAL_POLL_DELAY_MS = readPositiveInt(process.env.JUDGE0_INITIAL_POLL_DELAY_MS, 2000);
const POLL_STEP_DELAY_MS = readPositiveInt(process.env.JUDGE0_POLL_INTERVAL_MS, 2000);
const MAX_POLL_DELAY_MS = readPositiveInt(process.env.JUDGE0_MAX_POLL_INTERVAL_MS, 5000);
const JUDGE_RESULT_FIELDS = "status_id,time,memory,stdout,stderr,compile_output,message";

/**
 * Maps the frontend language string (e.g., 'javascript') to the required Judge0 language ID.
 * Returns undefined if an unknown language is passed.
 */
function getLanguageId(lang) {
  const language = {
    cpp: 54,
    java: 62,
    javascript: 63,
    python: 71,
  };

  return language[String(lang || "").toLowerCase()];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const encodeBase64Value = (value) => {
  if (value == null) {
    return value;
  }

  return Buffer.from(String(value), "utf8").toString("base64");
};

const decodeBase64Value = (value) => {
  if (value == null) {
    return value;
  }

  try {
    return Buffer.from(String(value), "base64").toString("utf8");
  } catch {
    return value;
  }
};

const decodeJudgeResult = (submissionResult) => ({
  ...submissionResult,
  stdout: decodeBase64Value(submissionResult.stdout),
  stderr: decodeBase64Value(submissionResult.stderr),
  compile_output: decodeBase64Value(submissionResult.compile_output),
  message: decodeBase64Value(submissionResult.message),
});

/**
 * Takes an array of submissions objects, encodes their values to base64 for safety,
 * and submits the entire batch in one API request to Judge0. 
 * This is an optimized alternative to looping single submissions.
 * Retries on 429 rate limits.
 */
async function submitBatch(submission, retries = DEFAULT_SUBMIT_RETRIES) {
  if (!Array.isArray(submission) || submission.length === 0) {
    return [];
  }

  const encodedSubmissions = submission.map(({ source_code, stdin, expected_output, ...rest }) => ({
    ...rest,
    source_code: encodeBase64Value(source_code),
    stdin: encodeBase64Value(stdin),
    expected_output: encodeBase64Value(expected_output),
  }));

  const options = {
    method: "POST",
    url: "https://judge029.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "true",
    },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": "judge029.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: { submissions: encodedSubmissions },
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429 && attempt < retries) {
        const waitTime = attempt * 2000;
        console.warn(`Judge0 rate limited (429). Retrying in ${waitTime / 1000}s... (attempt ${attempt}/${retries})`);
        await sleep(waitTime);
        continue;
      }

      console.error("Judge0 submitBatch error:", error.response?.status, error.message);
      throw error;
    }
  }
}

/**
 * Takes an array of tokens (from a successful submitBatch request) 
 * and repeatedly polls the Judge0 batch GET endpoint until all submissions 
 * in the batch are finished (status_id > 2).
 * Implements exponential backoff to prevent spamming the external API.
 */
async function submitToken(token, maxRetries = DEFAULT_MAX_POLL_RETRIES) {
  if (!Array.isArray(token) || token.length === 0) {
    return [];
  }

  const tokenStr = token.join(",");

  const options = {
    method: "GET",
    url: "https://judge029.p.rapidapi.com/submissions/batch",
    params: {
      tokens: tokenStr,
      base64_encoded: "true",
      fields: JUDGE_RESULT_FIELDS,
    },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": "judge029.p.rapidapi.com",
    },
  };

  let retryCount = 0;
  let waitTime = INITIAL_POLL_DELAY_MS;

  // Avoid an immediate poll right after submission, because results are usually still queued.
  await sleep(waitTime);

  while (retryCount < maxRetries) {
    try {
      const response = await axios.request(options);
      const result = response.data;

      if (!result || !result.submissions) {
        console.error("Failed to fetch submission result - empty response");
        retryCount++;
        await sleep(waitTime);
        waitTime = Math.min(waitTime + POLL_STEP_DELAY_MS, MAX_POLL_DELAY_MS);
        continue;
      }

      const isResultObtained = result.submissions.every((submissionResult) => submissionResult.status_id > 2);

      if (isResultObtained) {
        return result.submissions.map(decodeJudgeResult);
      }

      retryCount++;
      await sleep(waitTime);
      waitTime = Math.min(waitTime + POLL_STEP_DELAY_MS, MAX_POLL_DELAY_MS);
    } catch (error) {
      if (error.response?.status === 429) {
        waitTime = Math.min(waitTime + POLL_STEP_DELAY_MS, MAX_POLL_DELAY_MS);
        console.warn(`Judge0 rate limited (429) during polling. Waiting ${waitTime / 1000}s...`);
        await sleep(waitTime);
        retryCount++;
        continue;
      }

      console.error("Judge0 submitToken error:", error.response?.status, error.message);
      throw error;
    }
  }

  throw new Error("Judge0 timed out after " + maxRetries + " retries. The judge may be overloaded.");
}

/**
 * Executes a batch of code submissions against given test cases using Judge0.
 * Automatically handles batch submission, token polling, and result aggregation.
 * 
 * @param {string} sourceCode - The raw code to execute.
 * @param {number} languageId - The Judge0 language ID.
 * @param {Array<{input: string, output: string}>} testCases - Array of test cases.
 * @returns {Promise<Array>} Array of detailed evaluation results.
 */
async function executeCodeAndEvaluate(sourceCode, languageId, testCases) {
  if (!testCases || testCases.length === 0) {
    return [];
  }

  // 1. Prepare Judge0 Submissions
  const judgeSubmissions = testCases.map(({ input, output }) => ({
    source_code: sourceCode,
    language_id: languageId,
    stdin: input,
    expected_output: output ? output.trim() : ""
  }));

  // 2. Submit Batch to Judge0
  const submitResult = await submitBatch(judgeSubmissions);
  if (!submitResult || submitResult.length === 0) {
    throw new Error("Judge submission failed to return data");
  }

  const resultTokens = submitResult.map((value) => value?.token).filter(Boolean);
  if (resultTokens.length !== judgeSubmissions.length) {
    throw new Error("Judge submission failed to return execution tokens for all cases");
  }

  // 3. Poll for Results
  const testResults = await submitToken(resultTokens);

  // 4. Map and return detailed results
  return testResults.map((test, index) => {
    const input = testCases[index].input;
    const expectedOutput = testCases[index].output;
    let status = "Pending";
    let actualOutput = "";
    let error = null;

    if (test.status_id === 3) {
      status = "Accepted";
      actualOutput = test.stdout;
    } else if (test.status_id === 4) {
      status = "Wrong Answer";
      actualOutput = test.stdout || "";
    } else {
      status = "Error";
      error = test.stderr || test.compile_output || test.message || "Execution Error";
    }

    return {
      input,
      expectedOutput,
      actualOutput,
      status,
      error,
      statusId: test.status_id,
      time: parseFloat(test.time) || 0,
      memory: parseFloat(test.memory) || 0,
      raw_status_id: test.status_id
    };
  });
}

export { getLanguageId, submitBatch, submitToken, executeCodeAndEvaluate };
