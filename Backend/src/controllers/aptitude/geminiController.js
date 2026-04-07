import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question } from "../../model/aptitude/Question.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

const GEMINI_MODEL = process.env.GEMINI_APTITUDE_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function getGeminiApiKey() {
    return process.env.GEMINI_API_KEY_APTITUDE || process.env.GEMINI_API_KEY_AI_MOCK || process.env.GOOGLE_API_KEY || "";
}

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

function normalizeQuestions(questionsData, topic) {
    if (!Array.isArray(questionsData) || questionsData.length === 0) {
        throw new Error("Gemini returned an invalid question list.");
    }

    return questionsData.slice(0, 3).map((question, index) => {
        const questionText = String(question?.questionText || "").trim();
        const options = Array.isArray(question?.options)
            ? question.options.map((option) => String(option).trim()).filter(Boolean)
            : [];
        const correctAnswer = String(question?.correctAnswer || "").trim();
        const solution = String(question?.solution || "").trim();

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
            difficulty: DIFFICULTIES.includes(question?.difficulty) ? question.difficulty : DIFFICULTIES[index] || "Medium",
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

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        return res.status(503).json({
            message: "AI question generation is not configured on the backend. Add GEMINI_API_KEY_APTITUDE, GEMINI_API_KEY_AI_MOCK, or GOOGLE_API_KEY in production.",
        });
    }

    console.log("Generating questions for topic:", topic);
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const prompt = `
            Generate 3 unique aptitude questions for the topic: "${topic}".
            Provide exactly one "Easy", one "Medium", and one "Hard" question.
            Return the response in a VALID JSON array format.
            Each object in the array must follow this schema:
            {
                "questionText": "string",
                "options": ["string", "string", "string", "string"],
                "correctAnswer": "string",
                "category": "Aptitude",
                "difficulty": "Easy" | "Medium" | "Hard",
                "topic": "${topic}",
                "solution": "string"
            }
            Ensure correctAnswer is EXACTLY one of the options.
            Do not include any other text or markdown formatting except the JSON array.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
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
