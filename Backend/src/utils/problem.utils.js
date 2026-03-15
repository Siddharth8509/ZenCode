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

const DEFAULT_SUBMIT_RETRIES = readPositiveInt(process.env.JUDGE0_SUBMIT_RETRIES, 3);
const DEFAULT_MAX_POLL_RETRIES = readPositiveInt(process.env.JUDGE0_MAX_POLL_RETRIES, 18);
const INITIAL_POLL_DELAY_MS = readPositiveInt(process.env.JUDGE0_INITIAL_POLL_DELAY_MS, 2000);
const POLL_STEP_DELAY_MS = readPositiveInt(process.env.JUDGE0_POLL_INTERVAL_MS, 2000);
const MAX_POLL_DELAY_MS = readPositiveInt(process.env.JUDGE0_MAX_POLL_INTERVAL_MS, 5000);

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

async function submitBatch(submission, retries = DEFAULT_SUBMIT_RETRIES) {
  if (!Array.isArray(submission) || submission.length === 0) {
    return [];
  }

  const options = {
    method: "POST",
    url: "https://judge029.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "false",
    },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": "judge029.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: { submissions: submission },
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
      base64_encoded: "false",
      fields: "*",
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
        return result.submissions;
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

export { getLanguageId, submitBatch, submitToken };
