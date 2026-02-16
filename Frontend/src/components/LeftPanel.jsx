import {
    TagIcon,
    BriefcaseIcon,
    ChevronDownIcon,
    ClockIcon,
    CpuChipIcon,
    CheckCircleIcon,
    XCircleIcon,
    BookOpenIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { getSubmissionsApi } from "../api/submission";
import { useParams } from "react-router-dom";
import Markdown from 'react-markdown';

export default function LeftPanel({ prop }) {
    const companies = Array.isArray(prop?.companies)
        ? prop.companies
            .flatMap((item) => String(item).split(","))
            .map((c) => c.trim())
            .filter(Boolean)
        : [];
    const tags = Array.isArray(prop?.tags)
        ? prop.tags
        : prop?.tags
            ? [prop.tags]
            : [];
    const examples = Array.isArray(prop?.examples) ? prop.examples : [];
    const hints = Array.isArray(prop?.hints) ? prop.hints : [];

    const [activeTab, setActiveTab] = useState("description");
    const [submissions, setSubmissions] = useState([]);
    const [expandedHint, setExpandedHint] = useState(null);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        if (activeTab === "submissions" && id) {
            loadSubmissions();
        }
    }, [activeTab, id]);

    async function loadSubmissions() {
        setLoadingSubmissions(true);
        setSubmissionError(null);
        try {
            const result = await getSubmissionsApi(id);
            setSubmissions(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error(err);
            setSubmissionError("Failed to load submissions");
            setSubmissions([]);
        } finally {
            setLoadingSubmissions(false);
        }
    }

    const TABS = [
        { id: "description", label: "Description" },
        { id: "editorial", label: "Editorial" },
        { id: "submissions", label: "Submissions" },
    ];

    const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case "easy":
                return { text: "text-emerald-300", badge: "bg-emerald-500/10 border-emerald-500/20" };
            case "medium":
                return { text: "text-amber-300", badge: "bg-amber-500/10 border-amber-500/20" };
            case "hard":
                return { text: "text-rose-300", badge: "bg-rose-500/10 border-rose-500/20" };
            default:
                return { text: "text-slate-300", badge: "bg-slate-700/50 border-slate-600" };
        }
    };
    const diffColors = getDifficultyColor(prop?.difficulty);

    return (
        <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center h-12 px-6 border-b border-white/5 gap-1 bg-slate-950/80 shrink-0">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`h-full px-5 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.id
                            ? "text-orange-300 border-orange-400 bg-orange-500/10"
                            : "text-slate-400 border-transparent hover:text-slate-200"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-7 min-h-0">
                {activeTab === "description" && (
                    <>
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">{prop?.title || "Problem Title"}</h2>
                            <span
                                className={`px-4 py-1.5 rounded-full text-xs font-bold border ${diffColors.badge} ${diffColors.text}`}
                            >
                                {prop?.difficulty || "—"}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {companies.map((company, idx) => (
                                <span
                                    key={idx}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/10 text-xs font-medium text-slate-300"
                                >
                                    <BriefcaseIcon className="h-3.5 w-3.5 text-slate-400" />
                                    {company}
                                </span>
                            ))}
                            {tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-medium text-orange-300"
                                >
                                    <TagIcon className="h-3.5 w-3.5 text-orange-400" />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                                <Markdown>{prop?.description || "No description available."}</Markdown>
                            </div>
                        </div>

                        {examples.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Examples</h3>
                                {examples.map((ex, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden"
                                    >
                                        <div className="px-4 py-2 flex items-center gap-2 bg-slate-900/80 border-b border-white/10">
                                            <span className="text-sm font-semibold text-white">
                                                Example {idx + 1}
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-3 text-sm font-mono">
                                            <div className="flex gap-3">
                                                <span className="text-slate-500 w-14 shrink-0">Input</span>
                                                <span className="text-slate-200">{ex.input}</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <span className="text-slate-500 w-14 shrink-0">Output</span>
                                                <span className="text-emerald-300">{ex.output}</span>
                                            </div>
                                            {ex.explanation && (
                                                <div className="text-slate-400 text-xs pl-[58px] border-t border-white/5 pt-3 mt-2">
                                                    {ex.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {prop?.constraints && (
                            <div className="space-y-2 rounded-2xl bg-slate-900/80 border border-white/10 p-4">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <CpuChipIcon className="h-4 w-4 text-slate-400" />
                                    Constraints
                                </h3>
                                <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                                    <li>{prop.constraints}</li>
                                </ul>
                            </div>
                        )}

                        {hints.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-white">Hints</h3>
                                {hints.map((hint, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-xl bg-slate-900/80 border border-white/10 overflow-hidden"
                                    >
                                        <button
                                            onClick={() =>
                                                setExpandedHint(expandedHint === idx ? null : idx)
                                            }
                                            className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-slate-200 hover:bg-slate-950 transition-colors"
                                        >
                                            <span>Hint {idx + 1}</span>
                                            <ChevronDownIcon
                                                className={`h-4 w-4 transition-transform ${expandedHint === idx ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>
                                        <div
                                            className={`px-4 pb-4 text-sm text-slate-400 overflow-hidden transition-all duration-200 ${expandedHint === idx ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                                }`}
                                        >
                                            {hint}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === "submissions" && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Your Submissions</h3>

                        {loadingSubmissions && (
                            <div className="text-slate-400 text-sm flex items-center gap-2">
                                <div className="loader h-4 w-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                                Loading submissions...
                            </div>
                        )}

                        {submissionError && (
                            <div className="text-rose-400 text-sm flex items-center gap-2">
                                <XCircleIcon className="h-4 w-4" />
                                {submissionError}
                            </div>
                        )}

                        {!loadingSubmissions && !submissionError && submissions.length === 0 && (
                            <div className="text-slate-500 text-sm">No submissions yet.</div>
                        )}

                        {submissions.length > 0 && (
                            <div className="relative border-l-2 border-orange-500/30 pl-6 space-y-5">
                                {submissions.map((sub, idx) => {
                                    const isAccepted = sub.status?.toLowerCase() === "accepted";
                                    return (
                                        <div key={idx} className="relative">
                                            <div
                                                className={`absolute -left-[34px] top-1 h-4 w-4 rounded-full flex items-center justify-center ${isAccepted ? "bg-emerald-500" : "bg-rose-500"
                                                    }`}
                                            >
                                                {isAccepted ? (
                                                    <CheckCircleIcon className="h-3 w-3 text-white" />
                                                ) : (
                                                    <XCircleIcon className="h-3 w-3 text-white" />
                                                )}
                                            </div>
                                            <div className="rounded-xl bg-slate-900/80 border border-white/10 p-4 hover:border-orange-500/40 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span
                                                        className={`text-sm font-semibold ${isAccepted ? "text-emerald-300" : "text-rose-300"
                                                            }`}
                                                    >
                                                        {sub.status || "Unknown"}
                                                    </span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <ClockIcon className="h-3 w-3" />
                                                        {sub.createdAt
                                                            ? new Date(sub.createdAt).toLocaleString()
                                                            : "—"}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-400 flex items-center gap-4">
                                                    <span>Language: {sub.language || "—"}</span>
                                                    {sub.runtime != null && <span>Runtime: {sub.runtime} ms</span>}
                                                    {sub.memory != null && <span>Memory: {sub.memory} KB</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "editorial" && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <BookOpenIcon className="h-6 w-6 text-orange-400" />
                            <h3 className="text-xl font-bold text-white">Editorial</h3>
                        </div>

                        {prop?.editorial ? (
                            <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden p-6">
                                <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed
                                    prose-headings:text-white prose-headings:font-semibold
                                    prose-code:text-orange-300 prose-code:bg-slate-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                                    prose-pre:bg-slate-950/80 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
                                    prose-strong:text-white prose-a:text-orange-400">
                                    <Markdown>{prop.editorial}</Markdown>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-8 text-center">
                                <BookOpenIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm font-medium">No editorial found</p>
                                <p className="text-slate-600 text-xs mt-1">An editorial hasn't been added for this problem yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
