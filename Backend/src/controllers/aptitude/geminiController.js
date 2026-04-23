import { getGeminiClient, GEMINI_MODEL as BASE_MODEL, GEMINI_API_KEY } from "../../config/ai.js";
import { Question } from "../../model/aptitude/Question.js";

const GEMINI_MODEL = BASE_MODEL;
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function parseGeminiJson(text) {
    const cleanedText = String(text || "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleanedText);
    } catch (error) {
        const start = cleanedText.indexOf("[");
        const end = cleanedText.lastIndexOf("]");

        if (start !== -1 && end !== -1 && end > start) {
            return JSON.parse(cleanedText.slice(start, end + 1));
        }

        throw error;
    }
}

function getQuestionList(payload) {
    if (Array.isArray(payload)) return payload;

    if (payload && typeof payload === "object") {
        for (const key of ["questions", "data", "items", "results"]) {
            if (Array.isArray(payload[key])) return payload[key];
        }
    }

    throw new Error("Gemini returned an invalid question list.");
}

function stringifyValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" || typeof value === "boolean") return String(value).trim();

    if (typeof value === "object") {
        return String(value.text || value.value || value.option || value.label || value.answer || "").trim();
    }

    return "";
}

function normalizeOptions(rawOptions) {
    const optionSource = Array.isArray(rawOptions)
        ? rawOptions
        : rawOptions && typeof rawOptions === "object"
            ? Object.values(rawOptions)
            : [];

    return optionSource
        .map((option) => stringifyValue(option).replace(/^(?:option\s*)?[A-D][).:-]\s*/i, "").trim())
        .filter(Boolean)
        .slice(0, 4);
}

function normalizeDifficulty(rawDifficulty, index) {
    const requestedDifficulty = stringifyValue(rawDifficulty).toLowerCase();
    return DIFFICULTIES.find((difficulty) => difficulty.toLowerCase() === requestedDifficulty) || DIFFICULTIES[index] || "Medium";
}

function resolveCorrectAnswer(rawAnswer, options) {
    const answer = stringifyValue(rawAnswer);
    if (!answer) return "";

    const exactMatch = options.find((option) => option === answer);
    if (exactMatch) return exactMatch;

    const caseInsensitiveMatch = options.find((option) => option.toLowerCase() === answer.toLowerCase());
    if (caseInsensitiveMatch) return caseInsensitiveMatch;

    const letterMatch = answer.match(/^(?:option\s*)?([A-D])(?:[).:-])?$/i);
    if (letterMatch) {
        return options[letterMatch[1].toUpperCase().charCodeAt(0) - 65] || "";
    }

    const strippedAnswer = answer.replace(/^(?:option\s*)?[A-D][).:-]\s*/i, "").trim();
    return options.find((option) => option.toLowerCase() === strippedAnswer.toLowerCase()) || "";
}

function normalizeQuestions(questionsData, topic) {
    const questionList = getQuestionList(questionsData);

    if (questionList.length === 0) {
        throw new Error("Gemini returned an invalid question list.");
    }

    return questionList.slice(0, 3).map((question, index) => {
        const questionText = stringifyValue(question?.questionText || question?.question || question?.prompt || question?.text);
        const options = normalizeOptions(question?.options || question?.choices || question?.answers);
        const correctAnswer = resolveCorrectAnswer(question?.correctAnswer || question?.answer || question?.correctOption, options);
        const solution = stringifyValue(question?.solution || question?.explanation || question?.rationale);

        if (!questionText || options.length !== 4 || !correctAnswer || !solution) {
            throw new Error("Gemini returned an incomplete question.");
        }

        if (!options.includes(correctAnswer)) {
            throw new Error("Gemini returned a correct answer that is not present in the options.");
        }

        return {
            questionText,
            options,
            correctAnswer,
            category: "Aptitude",
            difficulty: normalizeDifficulty(question?.difficulty, index),
            topic,
            solution,
        };
    });
}

export const generateQuestions = async (req, res) => {
    const topic = String(req.body?.topic || req.query?.topic || "").trim();

    if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
    }

    if (!GEMINI_API_KEY) {
        return res.status(503).json({
            message: "AI is not configured. Set GEMINI_API_KEY in the backend .env file.",
        });
    }

    console.log("Generating questions for topic:", topic);
    try {
        const ai = getGeminiClient();

        const prompt = `
            Generate 3 unique aptitude questions for the topic: "${topic}".
            Provide exactly one "Easy", one "Medium", and one "Hard" question.
            Return the response in a VALID JSON array format.
            Each object in the array must follow this schema:
            {
                "questionText": "string",
                "options": ["string", "string", "string", "string"],
                "correctAnswer": "full option string, not A/B/C/D",
                "category": "Aptitude",
                "difficulty": "Easy" | "Medium" | "Hard",
                "topic": "${topic}",
                "solution": "string"
            }
            Ensure correctAnswer is EXACTLY one of the options.
            All values must be plain text strings. Do not return objects, diagrams, Mermaid, HTML, or code.
            Do not include any other text or markdown formatting except the JSON array.
        `;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
                maxOutputTokens: 4096,
            },
        });

        const text = response.text;
        const questionsData = normalizeQuestions(parseGeminiJson(text), topic);
        
        const savedQuestions = await Question.insertMany(questionsData);

        res.status(200).json(savedQuestions);
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ 
            message: "Failed to generate questions", 
            error: error.message 
        });
    }
};
