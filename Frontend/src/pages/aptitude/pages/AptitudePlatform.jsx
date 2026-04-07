import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosClient';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import QuestionCard from '../components/QuestionCard';
import Breadcrumbs from '../components/Breadcrumbs';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Navbar from '../components/Navbar';
import { SparklesIcon } from '@heroicons/react/24/solid';

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
        setQuestions(res.data);
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
      const res = await axios.post('/aptitude/gemini/generate', { topic: activeTopic });
      const generatedQuestions = Array.isArray(res.data) ? res.data : [];
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
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white transition-colors duration-300">

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
          <div className="max-w-5xl mx-auto">
            <Breadcrumbs activeTopic={activeTopic} />

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
                  <QuestionCard key={q._id} question={q} index={i} />
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