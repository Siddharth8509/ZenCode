// The AI assistant is intentionally scoped to the current page session.
// It mixes the active problem statement with the user's current code so replies stay grounded in context.
import React from "react";
import { GoogleGenAI } from "@google/genai";
import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL ?? "gemini-2.5-flash";

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

const DEFAULT_WELCOME_TEXT =
    "Hi! I'm **ZenCode AI**, your DSA tutor. Ask me anything about this problem or your code. I won't give you the answer right away - let's think through it together!";

const QUICK_ACTIONS = [
    { label: "Give me a hint", prompt: "Can you give me a hint for this problem without revealing the solution?" },
    { label: "Explain the approach", prompt: "Can you explain the optimal approach to solve this problem step by step?" },
    { label: "Review my code", prompt: "Can you review my current code and point out any issues or improvements?" },
];

function createMessage(role, text) {
    return { id: crypto.randomUUID(), role, text };
}

function createDefaultMessages() {
    return [createMessage("assistant", DEFAULT_WELCOME_TEXT)];
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="m-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
                    <p className="font-bold">Chatbot failed to load</p>
                    <p className="mt-2 font-mono text-sm">{this.state.error?.message}</p>
                </div>
            );
        }

        return this.props.children;
    }
}

function ChatbotInner({ prop, code, language }) {
    const propSafeguard = prop || {};
    const messagesRef = useRef(null);
    const chatRef = useRef(null);

    const [prompt, setPrompt] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [messages, setMessages] = useState(() => createDefaultMessages());

    const initializeChatSession = useCallback(() => {
        if (!API_KEY) {
            chatRef.current = null;
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            // We front-load the problem statement into the system prompt so follow-up questions stay anchored.
            const problemContext = `Problem Title: ${propSafeguard.title || "No Title"}\nProblem Description: ${propSafeguard.description || "No Description"}`;

            chatRef.current = ai.chats.create({
                model: MODEL_NAME,
                history: [],
                config: {
                    systemInstruction: `${SYSTEM_INSTRUCTION}\n\nThe user is currently solving the following problem:\n${problemContext}`,
                },
            });
        } catch (error) {
            chatRef.current = null;
            console.error("Error initializing Gemini Chat:", error);
        }
    }, [propSafeguard.description, propSafeguard.title]);

    useEffect(() => {
        setMessages(createDefaultMessages());
        initializeChatSession();
    }, [initializeChatSession]);

    useEffect(() => {
        const messageList = messagesRef.current;
        if (!messageList) return;
        messageList.scrollTop = messageList.scrollHeight;
    }, [isSending, messages]);

    function appendMessage(role, text) {
        setMessages((prev) => [...prev, createMessage(role, text)]);
    }

    async function sendPrompt(overridePrompt) {
        const trimmedPrompt = (overridePrompt || prompt).trim();
        if (!trimmedPrompt || isSending) return;

        appendMessage("user", trimmedPrompt);
        if (!overridePrompt) setPrompt("");
        setIsSending(true);

        try {
            if (!chatRef.current) {
                appendMessage("assistant", "Chat session unavailable. Please check your `VITE_GEMINI_API_KEY` in `.env`.");
                return;
            }

            const currentCodeContext = code
                ? `\n[Current Editor Code (${language})]:\n\`\`\`${language}\n${code}\n\`\`\`\n`
                : "";

            // Each prompt carries the latest editor code so the assistant can review in-progress work, not stale ideas.
            const enrichedPrompt = `${currentCodeContext}\nUser Question: ${trimmedPrompt}`;

            const response = await chatRef.current.sendMessage({ message: enrichedPrompt });
            const replyText =
                response.text?.trim() ||
                "I'm ready to help you think through this. Could you tell me what approach you're considering?";

            appendMessage("assistant", replyText);
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            appendMessage("assistant", "I could not get a response. Please check the API key and try again.");
        } finally {
            setIsSending(false);
        }
    }

    function handleSubmit(event) {
        if (event) event.preventDefault();
        sendPrompt();
    }

    function handleComposerKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendPrompt();
        }
    }

    function handleQuickAction(actionPrompt) {
        sendPrompt(actionPrompt);
    }

    return (
        <div className="flex h-full flex-col bg-black">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" ref={messagesRef}>
                {messages.map((message) => (
                    <div key={message.id} className={`chat ${message.role === "assistant" ? "chat-start" : "chat-end"}`}>
                        <div
                            className={`chat-bubble max-w-[90%] text-sm leading-relaxed ${
                                message.role === "assistant"
                                    ? "border border-white/10 bg-neutral-900 text-neutral-200"
                                    : "border border-orange-500/30 bg-orange-500/20 text-orange-100"
                            }`}
                        >
                            <div className="whitespace-pre-wrap break-words">
                                <Markdown>{message.text}</Markdown>
                            </div>
                        </div>
                    </div>
                ))}

                {isSending && (
                    <div className="chat chat-start">
                        <div className="chat-bubble border border-white/10 bg-neutral-900 text-neutral-400">
                            <span className="loading loading-dots loading-sm"></span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-white/5 px-4 py-2">
                {QUICK_ACTIONS.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => handleQuickAction(action.prompt)}
                        disabled={isSending}
                        className="whitespace-nowrap rounded-lg border border-white/10 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-300 transition-all hover:border-orange-500/30 hover:bg-orange-500/20 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            <div className="shrink-0 bg-black/80 p-3">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <textarea
                        className="h-12 flex-1 resize-none rounded-xl border border-white/10 bg-neutral-900/80 px-4 py-3 text-sm text-white transition-all placeholder:text-neutral-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        onKeyDown={handleComposerKeyDown}
                        placeholder="Ask about this DSA problem..."
                        rows="1"
                    />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || isSending}
                        className="btn h-12 rounded-xl border-none bg-orange-500 text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:opacity-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function Chatbot(props) {
    return (
        <ErrorBoundary>
            <ChatbotInner {...props} />
        </ErrorBoundary>
    );
}
