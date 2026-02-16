import { useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import {
    SparklesIcon,
    KeyIcon,
    PaperAirplaneIcon,
    ArrowPathIcon,
    TrashIcon,
} from "@heroicons/react/24/solid";
import { generateGeminiContent } from "../api/gemini";

const MODE_OPTIONS = [
    {
        id: "hint",
        label: "Hint Only",
        instruction: "Give a short hint without revealing the full solution.",
    },
    {
        id: "explain",
        label: "Explain Approach",
        instruction: "Explain the approach step-by-step and include time/space complexity.",
    },
    {
        id: "debug",
        label: "Debug My Code",
        instruction: "Identify bugs or edge cases in the code and suggest precise fixes.",
    },
    {
        id: "optimize",
        label: "Optimize",
        instruction: "Suggest optimizations or cleaner patterns without changing correctness.",
    },
];

const MODEL_OPTIONS = [
    { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
];

const buildProblemContext = (problem) => {
    if (!problem) return "";
    const parts = [];
    if (problem.title) parts.push(`Title: ${problem.title}`);
    if (problem.difficulty) parts.push(`Difficulty: ${problem.difficulty}`);
    if (problem.description) parts.push(`Description:\n${problem.description}`);

    if (Array.isArray(problem.examples) && problem.examples.length) {
        const exampleText = problem.examples
            .map((example, index) => {
                const outputLines = [];
                if (example.input) outputLines.push(`Input: ${example.input}`);
                if (example.output) outputLines.push(`Output: ${example.output}`);
                if (example.explanation) outputLines.push(`Explanation: ${example.explanation}`);
                return `Example ${index + 1}\n${outputLines.join("\n")}`;
            })
            .join("\n\n");
        parts.push(`Examples:\n${exampleText}`);
    }

    if (problem.constraints) parts.push(`Constraints:\n${problem.constraints}`);

    return parts.join("\n\n");
};

export default function AiPanel({ problem, code, language }) {
    const makeId = () =>
        typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const [apiKey, setApiKey] = useState(
        () => localStorage.getItem("zencode-gemini-key") || ""
    );
    const [keyVisible, setKeyVisible] = useState(false);
    const [keySaved, setKeySaved] = useState(
        () => Boolean(localStorage.getItem("zencode-gemini-key"))
    );
    const [model, setModel] = useState(MODEL_OPTIONS[0].id);
    const [mode, setMode] = useState(MODE_OPTIONS[0].id);
    const [includeProblem, setIncludeProblem] = useState(true);
    const [includeCode, setIncludeCode] = useState(true);
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const scrollRef = useRef(null);

    const problemContext = useMemo(() => buildProblemContext(problem), [problem]);

    const selectedMode = MODE_OPTIONS.find((item) => item.id === mode);

    const buildPrompt = () => {
        const sections = [
            "You are ZenCode AI, a concise coding interview assistant.",
            selectedMode?.instruction || "",
        ].filter(Boolean);

        const contextBlocks = [];
        if (includeProblem && problemContext) {
            contextBlocks.push(problemContext);
        }
        if (includeCode && code) {
            const lang = language || "text";
            contextBlocks.push(`User code (${lang}):\n\`\`\`${lang}\n${code}\n\`\`\``);
        }

        if (contextBlocks.length) {
            sections.push(`Context:\n${contextBlocks.join("\n\n")}`);
        }

        sections.push(`User request:\n${prompt.trim()}`);
        return sections.join("\n\n");
    };

    const handleSaveKey = () => {
        if (!apiKey.trim()) return;
        localStorage.setItem("zencode-gemini-key", apiKey.trim());
        setKeySaved(true);
    };

    const handleClearKey = () => {
        localStorage.removeItem("zencode-gemini-key");
        setApiKey("");
        setKeySaved(false);
    };

    const handleSend = async () => {
        if (!prompt.trim() || isLoading) return;
        if (!apiKey.trim()) {
            setError("Add your Gemini API key to continue.");
            return;
        }

        setError("");
        const userMessage = {
            id: makeId(),
            role: "user",
            text: prompt.trim(),
        };
        const assistantMessage = {
            id: makeId(),
            role: "assistant",
            text: "",
            loading: true,
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        setPrompt("");
        setIsLoading(true);

        try {
            const responseText = await generateGeminiContent({
                apiKey: apiKey.trim(),
                prompt: buildPrompt(),
                model,
            });
            setMessages((prev) =>
                prev.map((message) =>
                    message.id === assistantMessage.id
                        ? { ...message, text: responseText, loading: false }
                        : message
                )
            );
        } catch (err) {
            const errorText =
                err?.message ||
                "Something went wrong talking to Gemini. Try again.";
            setMessages((prev) =>
                prev.map((messageItem) =>
                    messageItem.id === assistantMessage.id
                        ? {
                            ...messageItem,
                            text: errorText,
                            loading: false,
                            error: true,
                        }
                        : messageItem
                )
            );
            setError(errorText);
        } finally {
            setIsLoading(false);
            requestAnimationFrame(() => {
                scrollRef.current?.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: "smooth",
                });
            });
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setError("");
    };

    return (
        <div className="flex flex-col gap-4 h-full min-h-0">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-red-400/20 blur-3xl"></div>
                <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300">
                            <SparklesIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                Gemini Assistant
                            </p>
                            <h3 className="text-lg font-semibold text-white">
                                Ask for hints, debugging, or optimization
                            </h3>
                        </div>
                    </div>
                    <div className="text-xs text-slate-400">
                        BYO Key
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr] min-h-0 flex-1">
                <div className="flex flex-col gap-4">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                            <KeyIcon className="h-4 w-4 text-orange-300" />
                            Gemini API Key
                        </div>

                        <div className="space-y-2">
                            <input
                                type={keyVisible ? "text" : "password"}
                                value={apiKey}
                                onChange={(event) => setApiKey(event.target.value)}
                                placeholder="Paste your Gemini API key"
                                className="input input-sm w-full bg-slate-950/60 text-slate-200 border border-white/10 focus:border-orange-500 focus:outline-none"
                            />
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs"
                                        checked={keyVisible}
                                        onChange={(event) =>
                                            setKeyVisible(event.target.checked)
                                        }
                                    />
                                    Show key
                                </label>
                                <span>
                                    {keySaved ? "Saved on this device" : "Not saved"}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                className="btn btn-sm bg-orange-600 hover:bg-orange-500 text-white border-none flex-1"
                                onClick={handleSaveKey}
                                disabled={!apiKey.trim()}
                            >
                                Save Key
                            </button>
                            <button
                                className="btn btn-sm btn-ghost text-slate-400 flex-1"
                                onClick={handleClearKey}
                            >
                                Clear
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs uppercase tracking-wider text-slate-500">
                                    Model
                                </label>
                                <select
                                    className="select select-sm w-full bg-slate-950/60 text-slate-200 border border-white/10 mt-2"
                                    value={model}
                                    onChange={(event) => setModel(event.target.value)}
                                >
                                    {MODEL_OPTIONS.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs uppercase tracking-wider text-slate-500">
                                    Mode
                                </label>
                                <select
                                    className="select select-sm w-full bg-slate-950/60 text-slate-200 border border-white/10 mt-2"
                                    value={mode}
                                    onChange={(event) => setMode(event.target.value)}
                                >
                                    {MODE_OPTIONS.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs"
                                        checked={includeProblem}
                                        onChange={(event) =>
                                            setIncludeProblem(event.target.checked)
                                        }
                                    />
                                    Use problem statement
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs"
                                        checked={includeCode}
                                        onChange={(event) =>
                                            setIncludeCode(event.target.checked)
                                        }
                                    />
                                    Use my code
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                        <div className="text-xs uppercase tracking-wider text-slate-500">
                            Quick prompts
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Give me a hint for the next step.",
                                "Find the bug in my code.",
                                "Explain edge cases I might miss.",
                                "Show a clean optimized approach.",
                            ].map((text) => (
                                <button
                                    key={text}
                                    className="px-3 py-1 rounded-full border border-white/10 text-xs text-slate-300 hover:border-orange-500/60 hover:text-orange-200 transition-colors"
                                    onClick={() => setPrompt(text)}
                                >
                                    {text}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col min-h-0 rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/60">
                        <div className="text-sm font-semibold text-slate-200">
                            Conversation
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="btn btn-xs btn-ghost text-slate-400"
                                onClick={handleClearChat}
                            >
                                <TrashIcon className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                                    <SparklesIcon className="h-5 w-5 text-orange-300" />
                                </div>
                                Start a chat to get hints and debugging help.
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm border ${message.error
                                            ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                                            : message.role === "user"
                                                ? "bg-orange-500/10 border-orange-400/20 text-orange-100"
                                                : "bg-slate-900/70 border-white/10 text-slate-200"
                                            }`}
                                    >
                                        {message.loading ? (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                                Thinking...
                                            </div>
                                        ) : (
                                            <Markdown className="prose prose-invert max-w-none">
                                                {message.text}
                                            </Markdown>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-white/10 bg-slate-950/60 p-4 space-y-2">
                        {error && (
                            <div className="text-xs text-rose-400">{error}</div>
                        )}
                        <div className="flex gap-2 items-end">
                            <textarea
                                value={prompt}
                                onChange={(event) => setPrompt(event.target.value)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" &&
                                        (event.ctrlKey || event.metaKey)
                                    ) {
                                        event.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask Gemini for a hint, explanation, or debugging help..."
                                className="textarea textarea-sm w-full bg-slate-900/60 text-slate-200 border border-white/10 focus:border-orange-500"
                                rows={3}
                            />
                            <button
                                className="btn btn-sm bg-orange-600 hover:bg-orange-500 text-white border-none gap-2"
                                onClick={handleSend}
                                disabled={isLoading || !prompt.trim()}
                                title="Send (Ctrl+Enter)"
                            >
                                <PaperAirplaneIcon className="h-4 w-4" />
                                Send
                            </button>
                        </div>
                        <div className="text-xs text-slate-500">
                            Tip: Add your key once and keep it local. Ctrl+Enter to send.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
