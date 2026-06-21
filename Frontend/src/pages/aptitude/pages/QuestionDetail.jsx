import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../utils/axiosClient";
import OptionButton from "../components/OptionButton";
import toast from "react-hot-toast";

const toText = (value, fallback = "") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string") return value.trim() || fallback;
    if (typeof value === "number" || typeof value === "boolean") return String(value);

    if (typeof value === "object") {
        const nestedValue = value.text || value.value || value.option || value.label || value.answer;
        return nestedValue ? toText(nestedValue, fallback) : fallback;
    }

    return fallback;
};

const normalizeOptions = (options) => {
    const optionSource = Array.isArray(options)
        ? options
        : options && typeof options === "object"
            ? Object.values(options)
            : [];

    return optionSource.map((option) => toText(option)).filter(Boolean);
};

const parseSolutionToSteps = (solutionText) => {
    if (!solutionText) return [];
    
    let lines = solutionText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length <= 1) {
        const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z0-9])/g;
        lines = solutionText.split(sentenceRegex).map(line => line.trim()).filter(Boolean);
    }
    
    // Clean up list prefixes like "Step 1:", "1.", "- ", "* ", "Step 1 -", etc. from each line
    return lines.map((line) => {
        return line.replace(/^(?:Step\s+\d+[:\-]?|\d+\.\s*|[\-\*\u2022]\s*)/i, '').trim();
    }).filter(Boolean);
};

const QuestionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [q, setQ] = useState(null);
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(45);

    const BASE_URL = "/aptitude";

    useEffect(() => {
        axios
            .get(`${BASE_URL}/questions/${id}`)
            .then((res) => setQ(res.data))
            .catch(console.error);
    }, [id]);

    useEffect(() => {
        if (!q || submitted) return;

        if (timeLeft <= 0) {
            setSubmitted(true);
            toast("Time's up");
            return;
        }

        const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
        return () => clearInterval(t);
    }, [timeLeft, submitted, q]);

    const format = (s) => (s < 10 ? `0${s}` : s);

    const handleSubmit = () => {
        if (!selected) return;

        setSubmitted(true);

        if (selected === toText(q?.correctAnswer)) {
            toast.success("Correct");
        } else {
            toast.error("Wrong");
        }
    };

    const reattempt = () => {
        setSelected(null);
        setSubmitted(false);
        setTimeLeft(45);
    };

    if (!q) {
        return (
            <div className="h-screen flex items-center justify-center font-bold text-neutral-500 bg-black">
                <span className="loading loading-spinner loading-lg text-orange-500"></span>
            </div>
        );
    }

    const questionText = toText(q.questionText, "Untitled question");
    const topic = toText(q.topic, "Aptitude");
    const company = toText(q.company);
    const difficulty = toText(q.difficulty, "Medium");
    const correctAnswer = toText(q.correctAnswer);
    const solution = toText(q.solution);
    const imageUrl = toText(q.imageUrl);
    const options = normalizeOptions(q.options);

    return (
        <div className="min-h-screen bg-black font-sans px-3 py-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm font-semibold text-neutral-400 hover:text-orange-400 transition-colors flex items-center gap-2 px-2"
                >
                    Back to Questions
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-9 glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none z-0" />

                        <div className="relative z-10">
                            <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase mb-4">
                                <span className="badge badge-outline border-orange-500 text-orange-400 px-3 py-3 rounded-lg bg-orange-500/10">
                                    {topic}
                                </span>

                                {company && (
                                    <span className="badge badge-outline border-amber-500 text-amber-400 px-3 py-3 rounded-lg bg-amber-500/10">
                                        {company}
                                    </span>
                                )}

                                <span className="badge badge-outline border-red-500 text-red-400 px-3 py-3 rounded-lg bg-red-500/10">
                                    {difficulty}
                                </span>
                            </div>

                            <h2 className="text-xl md:text-2xl font-semibold text-white leading-relaxed tracking-tight">
                                {questionText}
                            </h2>

                            {imageUrl && (
                                <div className="border border-white/10 rounded-2xl bg-neutral-900/60 p-4 flex justify-center backdrop-blur-md mt-6">
                                    <img
                                        src={imageUrl}
                                        alt="Question visual"
                                        className="max-h-64 object-contain rounded-lg"
                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="glass-panel rounded-3xl p-6 text-center sticky top-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 bg-neutral-900/60">
                            <button
                                disabled={!selected || submitted}
                                onClick={handleSubmit}
                                className={`btn w-full mb-6 font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all rounded-xl border-none ${
                                    !selected || submitted ? "bg-white/5 text-neutral-500" : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:from-orange-400 hover:to-red-400 active:scale-95"
                                }`}
                            >
                                Submit Answer
                            </button>

                            <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-2">
                                Time Remaining
                            </p>

                            <p
                                className={`text-4xl font-black tabular-nums tracking-tighter ${timeLeft <= 10
                                    ? "text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                                    : "text-white"
                                    }`}
                            >
                                00:{format(timeLeft)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 bg-neutral-900/40">
                    <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-widest mb-6 ml-1">Select an Option</h3>
                    {options.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {options.map((opt, i) => (
                                <OptionButton
                                    key={i}
                                    option={opt}
                                    isSelected={selected === opt}
                                    isSubmitted={submitted}
                                    isCorrect={opt === correctAnswer}
                                    isWrong={selected === opt && opt !== correctAnswer}
                                    onClick={() => setSelected(opt)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-500">No options are available for this question.</p>
                    )}
                </div>

                {submitted && (
                    <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4 border-l-4 border-l-orange-500 border-white/10 bg-neutral-900/60 animate-fade-in shadow-[0_0_30px_rgba(249,115,22,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-orange-500/10 to-transparent pointer-events-none" />

                        <div className="text-[11px] font-black text-orange-400 uppercase tracking-widest">
                            Correct Answer
                        </div>

                        <div className="text-xl font-bold text-white bg-black/40 p-3 rounded-xl border border-white/5 inline-block shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                            {correctAnswer || "Unavailable"}
                        </div>

                        {solution && (
                            <div className="text-sm text-neutral-300 border-t border-white/10 pt-6 leading-relaxed font-medium mt-4">
                                <span className="font-bold text-emerald-400 block mb-5 uppercase text-[11px] tracking-wider relative flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                    </svg>
                                    Step-by-Step Solution
                                </span>
                                
                                <div className="space-y-0 pl-1 mt-2">
                                    {parseSolutionToSteps(solution).map((step, idx, arr) => {
                                        const isLast = idx === arr.length - 1;
                                        return (
                                            <div key={idx} className="flex gap-4 group animate-rise" style={{ animationDelay: `${idx * 100}ms` }}>
                                                {/* Timeline Column */}
                                                <div className="flex flex-col items-center">
                                                    {/* Dot */}
                                                    <div className={`w-5 h-5 rounded-full border-2 bg-neutral-950 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                                                        isLast 
                                                            ? "border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" 
                                                            : "border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                                    }`}>
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            isLast ? "bg-orange-500 animate-pulse" : "bg-emerald-500"
                                                        }`} />
                                                    </div>
                                                    
                                                    {/* Line */}
                                                    {!isLast && (
                                                        <div className="w-[2px] flex-grow my-1 bg-neutral-800/80" />
                                                    )}
                                                </div>
                                                
                                                {/* Content Card Column */}
                                                <div className="flex-grow pb-5">
                                                    <div className={`p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md ${
                                                        isLast 
                                                            ? "bg-gradient-to-r from-orange-500/10 to-red-500/5 border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/15 shadow-[0_0_20px_rgba(249,115,22,0.08)]" 
                                                            : "bg-neutral-900/50 border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.02]"
                                                    }`}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                                isLast ? "text-orange-400" : "text-emerald-400/80"
                                                            }`}>
                                                                {isLast ? "Final Conclusion" : `Step ${idx + 1}`}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-neutral-300 font-medium leading-relaxed">
                                                            {step}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                onClick={reattempt}
                                className="btn btn-outline border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)] rounded-xl uppercase tracking-widest text-xs transition-colors"
                            >
                                Reattempt Question
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionDetail;
