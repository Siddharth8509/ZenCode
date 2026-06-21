// The AI assistant is intentionally scoped to the current page session.
// It now talks to the backend proxy so deployed environments do not rely on browser-side Gemini calls.
import React from "react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import axiosClient from "../utils/axiosClient";

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

function isDefaultWelcomeMessage(message) {
    return message?.role === "assistant" && message?.text === DEFAULT_WELCOME_TEXT;
}

function serializeConversation(messages) {
    if (!Array.isArray(messages)) return [];

    return messages
        .filter(
            (message) =>
                (message?.role === "user" || message?.role === "assistant") &&
                typeof message?.text === "string" &&
                message.text.trim().length > 0
        )
        .filter((message) => !isDefaultWelcomeMessage(message))
        .map((message) => ({
            role: message.role,
            text: message.text,
        }));
}

const chatMarkdownComponents = {
    p: ({ node: _node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
    ul: ({ node: _node, ...props }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />,
    ol: ({ node: _node, ...props }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />,
    li: ({ node: _node, ...props }) => <li className="pl-1" {...props} />,
    a: ({ node: _node, ...props }) => (
        <a className="break-all text-orange-200 underline underline-offset-2" {...props} />
    ),
    code: ({ node: _node, inline, className, children, ...props }) =>
        inline ? (
            <code
                className={`break-words rounded bg-black/40 px-1.5 py-0.5 font-mono text-[0.85em] text-orange-100 ${className || ""}`}
                {...props}
            >
                {children}
            </code>
        ) : (
            <code className={`block min-w-0 whitespace-pre font-mono text-xs ${className || ""}`} {...props}>
                {children}
            </code>
        ),
    pre: ({ node: _node, ...props }) => (
        <pre
            className="my-2 max-w-full overflow-x-auto rounded-lg border border-white/10 bg-black/45 p-3"
            {...props}
        />
    ),
    table: ({ node: _node, ...props }) => (
        <div className="my-2 max-w-full overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-left text-xs" {...props} />
        </div>
    ),
    th: ({ node: _node, ...props }) => <th className="border border-white/10 px-2 py-1 font-semibold" {...props} />,
    td: ({ node: _node, ...props }) => <td className="border border-white/10 px-2 py-1" {...props} />,
};

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

    const [prompt, setPrompt] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [messages, setMessages] = useState(() => createDefaultMessages());

    useEffect(() => {
        setMessages(createDefaultMessages());
    }, [propSafeguard.description, propSafeguard.title]);

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

        const conversationHistory = serializeConversation(messages);

        appendMessage("user", trimmedPrompt);
        if (!overridePrompt) setPrompt("");
        setIsSending(true);

        try {
            const { data } = await axiosClient.post("/ai/chat", {
                messages: conversationHistory,
                prompt: trimmedPrompt,
                code,
                language,
                problemTitle: propSafeguard.title || "No Title",
                problemDescription: propSafeguard.description || "No Description",
            });

            appendMessage(
                "assistant",
                data?.reply?.trim() ||
                    "I'm ready to help you think through this. Could you tell me what approach you're considering?"
            );
        } catch (error) {
            console.error("Error sending message to backend AI route:", error);
            const message =
                error?.response?.data?.error ||
                error?.message ||
                "I could not get a response right now.";
            appendMessage("assistant", message);
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
                    <div
                        key={message.id}
                        className={`chat min-w-0 ${message.role === "assistant" ? "chat-start" : "chat-end"}`}
                    >
                        <div
                            className={`chat-bubble min-w-0 max-w-[90%] overflow-hidden text-sm leading-relaxed ${
                                message.role === "assistant"
                                    ? "border border-white/10 bg-neutral-900 text-neutral-200"
                                    : "border border-orange-500/30 bg-orange-500/20 text-orange-100"
                            }`}
                        >
                            <div className="min-w-0 max-w-full overflow-hidden break-words">
                                <Markdown components={chatMarkdownComponents}>{message.text}</Markdown>
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
