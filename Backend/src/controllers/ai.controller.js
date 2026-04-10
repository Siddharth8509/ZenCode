// This controller proxies AI requests through the backend so production deployments
// do not depend on browser-side Gemini calls or exposed frontend API keys.
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `You are ZenCode AI, a strict DSA (Data Structures and Algorithms) instructor.

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

const generateChatReply = async (req, res) => {
    try {
        if (!GEMINI_API_KEY) {
            return res.status(503).json({
                error: "AI is not configured on the backend. Add GEMINI_API_KEY in your Render environment.",
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

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
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
                systemInstruction: `${SYSTEM_INSTRUCTION}\n\nThe user is currently solving the following problem:\nProblem Title: ${problemTitle}\nProblem Description: ${problemDescription}`,
            },
        });

        const reply =
            response.text?.trim() ||
            "I'm ready to help you think through this. Could you tell me what approach you're considering?";

        return res.status(200).json({ reply });
    } catch (error) {
        console.error("Gemini proxy error:", error);

        return res.status(502).json({
            error:
                error?.message ||
                error?.response?.data?.error?.message ||
                "The AI service could not generate a response right now.",
        });
    }
};

export { generateChatReply };
