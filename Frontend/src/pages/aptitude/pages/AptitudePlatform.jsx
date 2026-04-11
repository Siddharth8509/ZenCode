import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosClient';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import QuestionCard from '../components/QuestionCard';
import Breadcrumbs from '../components/Breadcrumbs';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { Bars3Icon } from '@heroicons/react/24/outline';

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

const normalizeQuestion = (question) => {
  const options = normalizeOptions(question?.options || question?.choices || question?.answers);
  const difficulty = toText(question?.difficulty, "Medium");

  return {
    ...(question || {}),
    questionText: toText(question?.questionText || question?.question || question?.prompt || question?.text, "Untitled question"),
    options,
    correctAnswer: toText(question?.correctAnswer || question?.answer || question?.correctOption, options[0] || ""),
    category: toText(question?.category, "Aptitude"),
    difficulty: ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium",
    topic: toText(question?.topic, "Aptitude"),
    solution: toText(question?.solution || question?.explanation || question?.rationale),
    company: toText(question?.company),
  };
};

const normalizeQuestionList = (items) => Array.isArray(items) ? items.map(normalizeQuestion) : [];

const requestGeneratedQuestions = async (topic) => {
  try {
    return await axios.post('/aptitude/gemini/generate', { topic });
  } catch (error) {
    if (![404, 405].includes(error.response?.status)) throw error;

    const params = new URLSearchParams({ topic });
    return axios.get(`/aptitude/gemini/generate?${params.toString()}`);
  }
};

const AptitudePlatform = ({ isMobileOpen, setIsMobileOpen }) => {
  const [activeTopic, setActiveTopic] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(""); // Track selected company
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Fetch data whenever topic or company changes
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeTopic) params.set("topic", activeTopic);
        if (selectedCompany) params.set("company", selectedCompany);
        const query = params.toString();

        const res = await axios.get(`/aptitude/questions${query ? `?${query}` : ""}`);
        setQuestions(normalizeQuestionList(res.data));
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [activeTopic, selectedCompany]); // Dependency array handles dynamic updates

  const handleGenerateAI = async () => {
    if (!activeTopic) {
      toast.error("Please select a topic from the sidebar first!");
      return;
    }
    setGeneratingAI(true);
    const toastId = toast.loading("Gemini is crafting questions for you...");
    try {
      const res = await requestGeneratedQuestions(activeTopic);
      const generatedQuestions = normalizeQuestionList(res.data);
      if (generatedQuestions.length === 0) {
        throw new Error("No questions were returned by the AI service.");
      }
      // The backend returns saved questions with _id
      setQuestions(prev => [...generatedQuestions, ...prev]);
      toast.success(`${generatedQuestions.length} new AI questions added!`, { id: toastId });
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to generate questions. Please try again.";
      toast.error(message, { id: toastId });
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-black text-white transition-colors duration-300">

      <div className="flex flex-1 overflow-hidden relative">

        {/* Sidebar receiving all filtering props */}
        <Sidebar
          onSelectTopic={setActiveTopic}
          activeTopic={activeTopic}
          selectedCompany={selectedCompany}
          onSelectCompany={setSelectedCompany}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto pt-2">
            <div className="flex items-center gap-3 mb-4 md:hidden">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 rounded-xl bg-white/5 text-neutral-300 hover:bg-white/10 transition-all border border-white/10"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <Breadcrumbs activeTopic={activeTopic} />
            </div>
            <div className="hidden md:block">
               <Breadcrumbs activeTopic={activeTopic} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-4xl font-black text-white flex flex-wrap items-center gap-4">
                  {selectedCompany && (
                    <span className="badge border border-orange-500 text-orange-400 bg-orange-500/10 px-4 py-3 rounded-2xl text-xs uppercase tracking-widest font-bold">
                      {selectedCompany}
                    </span>
                  )}
                  <span className="italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">{activeTopic || "All Questions"}</span>
                </h2>
                <p className="text-neutral-400 font-medium mt-2">
                  We found {questions.length} questions tailored for your selection.
                </p>
              </div>

              {activeTopic && (
                <button
                  onClick={handleGenerateAI}
                  disabled={generatingAI}
                  className={`btn glass rounded-2xl font-bold border border-white/10 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all
                    ${generatingAI
                      ? 'btn-disabled opacity-50'
                      : 'hover:border-orange-500/40 hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] active:scale-95 text-white bg-neutral-900/40'
                    }`}
                >
                  {generatingAI ? (
                    <>
                      <div className="loading loading-spinner loading-sm text-orange-400"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5 text-amber-400" />
                      Generate with Gemini AI
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Questions Grid */}
            {loading ? (
              <SkeletonLoader />
            ) : questions.length > 0 ? (
              <div className="grid gap-4">
                {questions.map((q, i) => (
                  <QuestionCard key={q._id || `${q.topic}-${q.questionText}-${i}`} question={q} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState topic={activeTopic} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AptitudePlatform;
