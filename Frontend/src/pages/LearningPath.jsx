import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";

const PATH_DATA = [
  {
    id: "basics",
    title: "Basics",
    subtitle: "Build core patterns and confidence",
    color: "from-orange-400/20 to-amber-400/10",
    questions: [
      "Arrays: Two Sum",
      "Strings: Valid Anagram",
      "Two Pointers: Remove Duplicates",
      "Stacks: Valid Parentheses",
      "Recursion: Fibonacci",
      "Hashing: First Unique Character",
    ],
  },
  {
    id: "intermediate",
    title: "Intermediate",
    subtitle: "Solidify common interview patterns",
    color: "from-red-400/20 to-rose-400/10",
    questions: [
      "Binary Search: Search in Rotated Array",
      "Linked List: Detect Cycle",
      "Sliding Window: Longest Substring",
      "Trees: Level Order Traversal",
      "Greedy: Jump Game",
      "DP: House Robber",
    ],
  },
  {
    id: "advanced",
    title: "Advanced",
    subtitle: "Master edge cases and optimization",
    color: "from-rose-400/20 to-red-400/10",
    questions: [
      "Graphs: Course Schedule",
      "DP: Longest Increasing Subsequence",
      "Trie: Implement Prefix Tree",
      "Backtracking: N-Queens",
      "Intervals: Merge Intervals",
      "System Design: Rate Limiter",
    ],
  },
];

export default function LearningPath() {
  const [openId, setOpenId] = useState(PATH_DATA[0].id);
  const [checked, setChecked] = useState(() => ({}));
  const [dailyGoal, setDailyGoal] = useState(3);
  const [showSolved, setShowSolved] = useState(true);
  const containerRef = useRef(null);

  const totalCount = useMemo(
    () => PATH_DATA.reduce((sum, item) => sum + item.questions.length, 0),
    []
  );

  const completedCount = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked]
  );

  const progress = Math.round((completedCount / totalCount) * 100);

  const nextUp = useMemo(() => {
    for (const section of PATH_DATA) {
      for (let i = 0; i < section.questions.length; i += 1) {
        const key = `${section.id}-${i}`;
        if (!checked[key]) {
          return { sectionId: section.id, sectionTitle: section.title, index: i, question: section.questions[i] };
        }
      }
    }
    return null;
  }, [checked]);

  const safeGoal = Math.max(1, dailyGoal);
  const todayProgress = Math.min(completedCount, safeGoal);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".path-reveal",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: "power2.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("zencode-learning-progress");
    const savedGoal = localStorage.getItem("zencode-learning-goal");
    const savedShow = localStorage.getItem("zencode-learning-show");
    if (saved) {
      try {
        setChecked(JSON.parse(saved));
      } catch {
        setChecked({});
      }
    }
    if (savedGoal) {
      const parsed = Number(savedGoal);
      if (!Number.isNaN(parsed)) setDailyGoal(Math.min(10, Math.max(1, parsed)));
    }
    if (savedShow) {
      setShowSolved(savedShow === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("zencode-learning-progress", JSON.stringify(checked));
  }, [checked]);

  useEffect(() => {
    localStorage.setItem("zencode-learning-goal", String(dailyGoal));
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem("zencode-learning-show", String(showSolved));
  }, [showSolved]);

  const handleToggle = (groupId, index) => {
    const key = `${groupId}-${index}`;
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/20 font-sans">
      <Navbar />

      <div className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-[-10%] w-[45%] h-[45%] bg-orange-400/40 blur-[140px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[55%] h-[55%] bg-red-400/40 blur-[140px] rounded-full" />
        </div>

        <div ref={containerRef} className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="path-reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-slate-900/70 text-xs uppercase tracking-[0.3em] text-slate-500">
              Structured Learning
            </div>
            <h1 className="path-reveal mt-6 text-4xl md:text-6xl font-semibold tracking-tight">
              Your DSA Journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">organized by mastery</span>
            </h1>
            <p className="path-reveal mt-6 text-lg text-slate-400 max-w-2xl">
              Work through a curated set of questions from basic to advanced. Track your progress, unlock milestones, and build confidence one section at a time.
            </p>
          </motion.div>

          <div className="mt-10 path-reveal">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>{completedCount} / {totalCount} solved</span>
              <span>{progress}% complete</span>
            </div>
            <div className="mt-3 h-3 w-full bg-white/10 rounded-full border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="path-reveal glass-panel p-5 rounded-2xl border border-white/10">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Daily Goal</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-2xl font-semibold">{dailyGoal} questions</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDailyGoal((g) => Math.max(1, g - 1))}
                    className="h-8 w-8 rounded-full border border-white/10 hover:border-orange-400/60 text-slate-400"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setDailyGoal((g) => Math.min(10, g + 1))}
                    className="h-8 w-8 rounded-full border border-white/10 hover:border-orange-400/60 text-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  style={{ width: `${Math.round((todayProgress / safeGoal) * 100)}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-500">Today: {todayProgress}/{safeGoal}</div>
            </div>

            <div className="path-reveal glass-panel p-5 rounded-2xl border border-white/10">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Next Up</div>
              {nextUp ? (
                <div className="mt-3 space-y-2">
                  <div className="text-lg font-semibold">{nextUp.question}</div>
                  <div className="text-sm text-slate-500">Section: {nextUp.sectionTitle}</div>
                  <button
                    type="button"
                    onClick={() => setOpenId(nextUp.sectionId)}
                    className="mt-2 inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-semibold"
                  >
                    Jump to section &gt;
                  </button>
                </div>
              ) : (
                <div className="mt-3 text-sm text-slate-500">You've completed the path. Great work!</div>
              )}
            </div>

            <div className="path-reveal glass-panel p-5 rounded-2xl border border-white/10">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Focus Mode</div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{showSolved ? "Show all questions" : "Hide solved"}</div>
                  <div className="text-sm text-slate-500">Reduce clutter while practicing.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSolved((s) => !s)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${showSolved ? "border-white/10 text-slate-400" : "border-orange-400/60 text-orange-300"
                    }`}
                >
                  {showSolved ? "Hide Solved" : "Show All"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-6">
            {PATH_DATA.map((section) => (
              <div
                key={section.id}
                className="path-reveal border border-white/10 rounded-2xl overflow-hidden bg-slate-900/70"
              >
                <button
                  type="button"
                  onClick={() => setOpenId((prev) => (prev === section.id ? "" : section.id))}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-950 transition-colors"
                >
                  <div>
                    <h3 className="text-2xl font-semibold">{section.title}</h3>
                    <p className="text-sm text-slate-500">{section.subtitle}</p>
                  </div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    {openId === section.id ? "Collapse" : "Expand"}
                  </div>
                </button>

                <div
                  className={`transition-all duration-500 overflow-hidden ${openId === section.id ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className={`px-6 pb-6 pt-2 bg-gradient-to-br ${section.color}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.questions.map((question, index) => {
                        const key = `${section.id}-${index}`;
                        if (!showSolved && checked[key]) return null;
                        return (
                          <label
                            key={key}
                            className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-slate-900/70 hover:bg-slate-950 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={!!checked[key]}
                              onChange={() => handleToggle(section.id, index)}
                              className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900/70 text-orange-400 focus:ring-orange-400"
                            />
                            <div>
                              <div className="text-sm text-slate-500">Question {index + 1}</div>
                              <div className="text-base font-medium text-white">{question}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
