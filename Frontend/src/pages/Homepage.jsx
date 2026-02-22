import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";

export default function Homepage() {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-reveal",
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 }
      );
      gsap.fromTo(
        ".hero-card",
        { scale: 0.96, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, ease: "power2.out", delay: 0.2 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/20 font-sans overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 left-[-20%] w-[60%] h-[60%] bg-orange-400/30 rounded-full blur-[160px]" />
        <div className="absolute top-[10%] right-[-15%] w-[50%] h-[50%] bg-red-400/30 rounded-full blur-[160px]" />
        <div className="absolute inset-0 grid-overlay opacity-25" />
      </div>

      <Navbar />

      <div className="relative z-10 w-full pt-28 pb-24">
        <div ref={heroRef} className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div className="space-y-7">
              <div className="hero-reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs uppercase tracking-[0.3em] text-slate-300">
                Professional SDE Prep
              </div>
              <h1 className="hero-reveal text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
                Master Algorithms
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400">
                  {" "}Systematically
                </span>
              </h1>
              <p className="hero-reveal text-lg md:text-xl text-slate-400 max-w-xl">
                ZenCode provides a structured roadmap to technical interview success. Track progress, master patterns, and build problem-solving intuition.
              </p>
              <div className="hero-reveal flex flex-col sm:flex-row gap-4">
                <Link
                  to="/problemset"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-lg rounded-full hover:from-orange-600 hover:to-red-600 transition-colors shadow-xl shadow-orange-900/20"
                >
                  Start Solving
                </Link>
                <Link
                  to="/problemset"
                  className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all text-lg font-medium text-slate-300 hover:text-white"
                >
                  Explore Problems
                </Link>
              </div>
              <div className="hero-reveal flex flex-wrap gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                  120+ curated DSA problems
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  Daily practice streaks
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Mock interviews every week
                </div>
              </div>
            </div>

            <div className="hero-card relative">
              <div className="glass-panel p-6 rounded-3xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Today</p>
                    <h3 className="text-2xl font-semibold">Binary Search Sprint</h3>
                  </div>
                  <div className="mono text-sm text-orange-300 border border-orange-500/30 px-3 py-1 rounded-full bg-orange-500/10">
                    64% complete
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    "Find Minimum in Rotated Array",
                    "Search Insert Position",
                    "Koko Eating Bananas",
                    "Median of Two Sorted Arrays",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/70 border border-white/10"
                    >
                      <div>
                        <div className="text-xs text-slate-500">Problem {index + 1}</div>
                        <div className="text-base font-medium">{item}</div>
                      </div>
                      <span className={`text-xs mono ${index < 2 ? "text-emerald-400" : "text-slate-500"}`}>
                        {index < 2 ? "Solved" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 h-3 w-full rounded-full bg-slate-900/80 border border-white/10 overflow-hidden">
                  <div className="h-full w-[64%] bg-gradient-to-r from-orange-500 to-red-500" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-slate-900/70 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-400">
                Next unlock: Graphs Week
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Active Learners", value: "18,400+" },
              { label: "Solutions Reviewed", value: "2.1M+" },
              { label: "Hiring Partners", value: "120+" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="glass-panel p-6 rounded-2xl border border-white/10"
              >
                <div className="text-3xl font-semibold">{stat.value}</div>
                <div className="text-slate-500 text-sm uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 mt-28 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold">Structured Problem Practice</h2>
            <p className="text-slate-400 text-lg">
              Practice problems by topic and difficulty with a clear structure that keeps your preparation consistent.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Progress tracker",
                "Daily practice goals",
                "Pattern-based grouping",
                "Review checkpoints",
              ].map((item) => (
                <div key={item} className="p-4 rounded-2xl bg-slate-900/70 border border-white/10">
                  <div className="text-sm font-semibold">{item}</div>
                  <div className="text-xs text-slate-500 mt-1">Built to keep you consistent.</div>
                </div>
              ))}
            </div>
            <Link
              to="/problemset"
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold"
            >
              Go to Problem Set &gt;
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-panel p-8 rounded-3xl border border-white/10"
          >
            <h3 className="text-xl font-semibold">Week 3: Trees</h3>
            <p className="text-slate-500 text-sm mt-2">Focus: DFS, BFS, traversals</p>
            <div className="mt-6 space-y-3">
              {["Binary Tree Paths", "Validate BST", "Zigzag Level Order"].map((item, index) => (
                <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-white/10">
                  <span>{item}</span>
                  <span className={`text-xs mono ${index < 1 ? "text-emerald-400" : "text-slate-500"}`}>
                    {index < 1 ? "Solved" : "Queued"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 h-2 w-full rounded-full bg-slate-900/80 overflow-hidden">
              <div className="h-full w-[34%] bg-gradient-to-r from-orange-500 to-red-500" />
            </div>
          </motion.div>
        </div>

        <div className="container mx-auto px-6 mt-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold">Interview Toolkit</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Combine practice, feedback, and mock interviews in a single flow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Company Tracks",
                desc: "Target Google, Amazon, Microsoft with focused sets.",
              },
              {
                title: "Timed Mocks",
                desc: "Simulate the real interview experience weekly.",
              },
              {
                title: "Review Studio",
                desc: "See mistakes, patterns, and personalized tips.",
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="glass-panel p-7 rounded-2xl border border-white/10"
              >
                <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
                <p className="text-slate-400">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 mt-28">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold">Frequently Asked</h2>
              <p className="text-slate-400 text-lg">
                Answers to common questions about structure, progress, and interview readiness.
              </p>
              <div className="glass-panel p-5 rounded-2xl border border-white/10 text-sm text-slate-400">
                Build a personal roadmap with milestones and checkpoints, just like a real engineering team would.
              </div>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "How is the learning path organized?",
                  a: "Problems are grouped by patterns and difficulty. Each section builds on the previous one.",
                },
                {
                  q: "Can I track my progress?",
                  a: "Yes. Every solved question updates your progress bar and weekly goals.",
                },
                {
                  q: "Do you have company-specific practice?",
                  a: "We provide curated tracks for top companies with mock interview schedules.",
                },
              ].map((item) => (
                <details key={item.q} className="glass-panel p-5 rounded-2xl border border-white/10">
                  <summary className="cursor-pointer text-lg font-semibold text-white">{item.q}</summary>
                  <p className="mt-3 text-slate-400 text-sm">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 mt-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 p-10 md:p-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold">Ready to level up?</h2>
                <p className="text-slate-400 mt-3 max-w-xl">
                  Build your streak with consistent problem-solving and see your progress climb.
                </p>
              </div>
              <Link
                to="/signup"
                className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-lg rounded-full hover:from-orange-600 hover:to-red-600 transition-colors"
              >
                Join ZenCode
              </Link>
            </div>
          </div>
        </div>

        <footer className="container mx-auto px-6 mt-20 pb-12 text-sm text-slate-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="text-slate-400">ZenCode (c) 2026. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-300 cursor-pointer">Terms</span>
              <span className="hover:text-slate-300 cursor-pointer">Privacy</span>
              <span className="hover:text-slate-300 cursor-pointer">Support</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
