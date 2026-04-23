// This controller proxies AI requests through the backend so production deployments
// do not depend on browser-side Gemini calls or exposed frontend API keys.
import { getGeminiClient, GEMINI_MODEL, GEMINI_API_KEY } from "../config/ai.js";

const DSA_SYSTEM_INSTRUCTION = `You are ZenCode AI, a strict DSA (Data Structures and Algorithms) instructor.

RULES YOU MUST FOLLOW:
1. You ONLY discuss DSA topics - algorithms, data structures, time/space complexity, coding problems, and related computer science fundamentals.
2. If the user asks about ANYTHING outside DSA (e.g. web development, general chat, jokes, personal questions, other subjects), politely decline and redirect them back to DSA.
3. NEVER give the full solution or code upfront. Follow a Socratic teaching method:
   - First, give conceptual hints and ask the user to think.
   - Then, walk them through the approach step-by-step.
   - Only when the user explicitly says something like "give me the answer", "show me the code", or "explain the full solution", provide the complete breakdown with code.
4. When you DO give code, break it down line by line and explain the reasoning behind each step.
5. Format all responses using Markdown. Use code blocks for code snippets.
6. Be encouraging but firm - push the user to think before revealing answers.
7. Keep responses concise and focused. Avoid unnecessary filler text.`;

function sanitizeMessages(messages) {
    if (!Array.isArray(messages)) return [];

    return messages
        .filter(
            (message) =>
                (message?.role === "user" || message?.role === "assistant") &&
                typeof message?.text === "string" &&
                message.text.trim().length > 0
        )
        .map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.text }],
        }));
}

function createAiConfigurationError() {
    return Object.assign(
        new Error("AI is not configured. Set GEMINI_API_KEY in the backend .env file."),
        { statusCode: 503 }
    );
}

function getAiClient() {
    if (!GEMINI_API_KEY) {
        throw createAiConfigurationError();
    }

    return getGeminiClient();
}

function parseJsonPayload(text) {
    const cleanedText = String(text || "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    if (!cleanedText) {
        throw new Error("AI returned an empty response.");
    }

    try {
        return JSON.parse(cleanedText);
    } catch (error) {
        const arrayStart = cleanedText.indexOf("[");
        const arrayEnd = cleanedText.lastIndexOf("]");
        if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
            return JSON.parse(cleanedText.slice(arrayStart, arrayEnd + 1));
        }

        const objectStart = cleanedText.indexOf("{");
        const objectEnd = cleanedText.lastIndexOf("}");
        if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
            return JSON.parse(cleanedText.slice(objectStart, objectEnd + 1));
        }

        throw error;
    }
}

function toTrimmedString(value) {
    return String(value || "").trim();
}

function clampScore(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return 0;
    return Math.max(0, Math.min(10, Number(numericValue.toFixed(1))));
}

function normalizeStringList(value, maxItems) {
    const list = Array.isArray(value)
        ? value
        : typeof value === "string" && value.trim()
            ? [value]
            : [];

    return list
        .map((item) => toTrimmedString(item))
        .filter(Boolean)
        .slice(0, maxItems);
}

function normalizeMockInterviewQuestions(payload) {
    const questionList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.questions)
            ? payload.questions
            : [];

    const normalizedQuestions = questionList
        .map((item) => ({
            question: toTrimmedString(item?.question || item?.questionText || item?.prompt),
            answer: toTrimmedString(item?.answer || item?.sampleAnswer || item?.modelAnswer),
        }))
        .filter((item) => item.question && item.answer)
        .slice(0, 8);

    if (normalizedQuestions.length === 0) {
        throw new Error("AI did not return valid mock interview questions.");
    }

    return normalizedQuestions;
}

function normalizeMockInterviewFeedback(payload) {
    return {
        ratings: clampScore(payload?.ratings),
        feedback:
            toTrimmedString(payload?.feedback) ||
            "Your answer covers part of the question, but it needs more depth and precision.",
        communicationScore: clampScore(payload?.communicationScore),
        communicationFeedback:
            toTrimmedString(payload?.communicationFeedback) ||
            "Your delivery is understandable, but clearer structure and more confident phrasing would make the answer stronger.",
        improvementTips:
            normalizeStringList(payload?.improvementTips, 3).length > 0
                ? normalizeStringList(payload?.improvementTips, 3)
                : [
                    "Answer in a clear beginning, middle, and end.",
                    "Add one concrete example from your experience.",
                    "Finish by stating the result or impact.",
                ],
        strengths:
            normalizeStringList(payload?.strengths, 2).length > 0
                ? normalizeStringList(payload?.strengths, 2)
                : ["You stayed on topic.", "You attempted to explain your thinking."],
    };
}

async function generateJsonResponse(prompt, options = {}) {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxOutputTokens ?? 4096,
        },
    });

    return parseJsonPayload(response.text);
}

const generateChatReply = async (req, res) => {
    try {
        if (!GEMINI_API_KEY) {
            return res.status(503).json({
                error: "AI is not configured. Set GEMINI_API_KEY in the backend .env file.",
            });
        }

        const {
            messages = [],
            prompt = "",
            code = "",
            language = "",
            problemTitle = "No Title",
            problemDescription = "No Description",
        } = req.body || {};

        const trimmedPrompt = String(prompt || "").trim();
        if (!trimmedPrompt) {
            return res.status(400).json({ error: "Prompt is required." });
        }

        const ai = getAiClient();
        const currentCodeContext = code
            ? `\n[Current Editor Code (${language || "text"})]:\n\`\`\`${language || ""}\n${code}\n\`\`\`\n`
            : "";
        const enrichedPrompt = `${currentCodeContext}\nUser Question: ${trimmedPrompt}`;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                ...sanitizeMessages(messages),
                { role: "user", parts: [{ text: enrichedPrompt }] },
            ],
            config: {
                systemInstruction: `${DSA_SYSTEM_INSTRUCTION}\n\nThe user is currently solving the following problem:\nProblem Title: ${problemTitle}\nProblem Description: ${problemDescription}`,
            },
        });

        const reply =
            response.text?.trim() ||
            "I'm ready to help you think through this. Could you tell me what approach you're considering?";

        return res.status(200).json({ reply });
    } catch (error) {
        console.error("Gemini proxy error:", error);

        return res.status(error?.statusCode || 502).json({
            error:
                error?.message ||
                error?.response?.data?.error?.message ||
                "The AI service could not generate a response right now.",
        });
    }
};

const generateMockInterviewQuestions = async (req, res) => {
    try {
        const position = toTrimmedString(req.body?.position);
        const description = toTrimmedString(req.body?.description);
        const techStack = toTrimmedString(req.body?.techStack);
        const experience = Number(req.body?.experience);

        if (!position || !description || !techStack || !Number.isFinite(experience) || experience < 0) {
            return res.status(400).json({
                error: "Position, description, experience, and tech stack are required.",
            });
        }

        const payload = await generateJsonResponse(
            `Generate a JSON array of 8 technical interview questions with concise answers (2-4 sentences each) based on this job info:

- Position: ${position}
- Description: ${description}
- Experience: ${experience} years
- Tech Stack: ${techStack}

Return ONLY a JSON array like: [{"question": "...", "answer": "..."}]
Keep answers brief but informative. No markdown, no code blocks, no extra text.`,
            { temperature: 0.7, maxOutputTokens: 4096 }
        );

        return res.status(200).json({
            questions: normalizeMockInterviewQuestions(payload),
        });
    } catch (error) {
        console.error("Mock interview question generation error:", error);

        return res.status(error?.statusCode || 502).json({
            error:
                error?.message ||
                "The AI service could not generate mock interview questions right now.",
        });
    }
};

const generateMockInterviewFeedback = async (req, res) => {
    try {
        const questionText = toTrimmedString(req.body?.questionText);
        const correctAnswer = toTrimmedString(req.body?.correctAnswer);
        const answerText = toTrimmedString(req.body?.answerText);

        if (!questionText || !correctAnswer || !answerText) {
            return res.status(400).json({
                error: "Question, correct answer, and user answer are required.",
            });
        }

        const payload = await generateJsonResponse(
            `Question: "${questionText}"
User Answer: "${answerText}"
Correct Answer: "${correctAnswer}"

Act as an experienced interview coach. Compare the user's answer with the correct answer.

Return ONLY valid JSON with this exact shape:
{
  "ratings": number,
  "feedback": string,
  "communicationScore": number,
  "communicationFeedback": string,
  "improvementTips": ["tip 1", "tip 2", "tip 3"],
  "strengths": ["strength 1", "strength 2"]
}

Rules:
- ratings must be a number from 1 to 10 for technical quality.
- feedback must be 2 or 3 sentences and explain correctness, missing depth, and what to improve.
- communicationScore must be a number from 1 to 10 based on clarity, structure, confidence, and conciseness.
- communicationFeedback must be 2 sentences focused only on speaking and communication quality.
- improvementTips must contain exactly 3 short, actionable strings.
- strengths must contain exactly 2 short positive strings.
- No markdown, no code fences, no extra text.`,
            { temperature: 0.4, maxOutputTokens: 2048 }
        );

        return res.status(200).json({
            feedback: normalizeMockInterviewFeedback(payload),
        });
    } catch (error) {
        console.error("Mock interview feedback generation error:", error);

        return res.status(error?.statusCode || 502).json({
            error:
                error?.message ||
                "The AI service could not generate interview feedback right now.",
        });
    }
};

export { generateChatReply, generateMockInterviewQuestions, generateMockInterviewFeedback };
