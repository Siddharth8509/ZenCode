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
                                <span className="font-bold text-emerald-400 block mb-3 uppercase text-[10px] tracking-wider relative flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Solution / Explanation
                                </span>
                                {solution}
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
