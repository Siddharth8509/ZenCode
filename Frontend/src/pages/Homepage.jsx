import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Binary,
  BookOpenText,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FilePenLine,
  FileSearch,
  GraduationCap,
  Mic,
  PlayCircle,
  Route,
  ScanSearch,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import LayoutGridDemo from "../components/layout-grid-demo";
import ZenCodeMark from "../components/ZenCodeMark";
import { Footer } from "../components/ui/footer-section";

gsap.registerPlugin(ScrollTrigger);

const proofStats = [
  {
    value: "250",
    label: "Curated DSA Questions",
    detail: "Pattern-based practice built for interview repetition.",
  },
  {
    value: "Topic-Wise",
    label: "Aptitude Coverage",
    detail: "Quant, logical, and verbal prep in one drill flow.",
  },
  {
    value: "AI + ATS",
    label: "Resume Tools",
    detail: "Build, score, and improve resumes with role-aware feedback.",
  },
  {
    value: "Mock Ready",
    label: "Interview Simulation",
    detail: "Practice answers, communication, and confidence on demand.",
  },
];

const journeyStages = [
  {
    step: "01",
    title: "Get your resume application-ready",
    description:
      "Start with the builder and analyzer so your profile is clean, ATS-friendly, and strong enough to earn the interview.",
    icon: ScanSearch,
    note: "Your applications should open doors before DSA even matters.",
  },
  {
    step: "02",
    title: "Clear the online assessment",
    description:
      "Use DSA and aptitude together so your prep mirrors the first real filter companies throw at you.",
    icon: Target,
    note: "Solve coding and aptitude in the same rhythm, not as separate tracks.",
  },
  {
    step: "03",
    title: "Strengthen concepts before the round",
    description:
      "Review videos and PDFs for CS fundamentals, languages, and interview concepts without jumping between random tabs.",
    icon: GraduationCap,
    note: "Concept revision stays close to practice instead of getting lost in bookmarks.",
  },
  {
    step: "04",
    title: "Rehearse the actual conversation",
    description:
      "Run mock interviews, sharpen communication, and enter the room already practiced instead of just informed.",
    icon: PlayCircle,
    note: "This is where knowledge turns into confident delivery.",
  },
];

const operatingSystemCards = [
  {
    icon: Workflow,
    title: "One connected prep loop",
    description:
      "Practice, revision, resume polish, and interview simulation live inside one product instead of six disconnected tools.",
  },
  {
    icon: Sparkles,
    title: "AI where it actually helps",
    description:
      "ZenCode uses AI for resume analysis, interview practice, and feedback that helps you improve faster.",
  },
  {
    icon: Route,
    title: "Built like a roadmap",
    description:
      "Every section is organized to reduce overwhelm and keep you moving from application to final round with intention.",
  },
  {
    icon: Target,
    title: "One goal, one platform",
    description:
      "Stop switching between tabs. Everything you need to land the offer is already here, waiting for you.",
  },
];

const dashboardModules = [
  {
    icon: Binary,
    name: "DSA Sprint",
    detail: "Arrays -> Trees -> Graphs",
    metric: "72%",
  },
  {
    icon: BrainCircuit,
    name: "Aptitude Rhythm",
    detail: "Percentages, LR, verbal",
    metric: "48 drills",
  },
  {
    icon: BookOpenText,
    name: "Concept Revision",
    detail: "OS, DBMS, CN, OOP",
    metric: "11 lessons",
  },
  {
    icon: Mic,
    name: "Mock Interview",
    detail: "Clarity + confidence practice",
    metric: "3 sessions",
  },
];

function ModuleGridContent({ label, title, description, points }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.28em] text-orange-200/85">
        {label}
      </p>
      <p className="mt-4 text-2xl font-semibold text-white md:text-4xl">
        {title}
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-200 md:text-base">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {points.map((point) => (
          <span
            key={point}
            className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-100"
          >
            {point}
          </span>
        ))}
      </div>
    </div>
  );
}

const moduleGridCards = [
  {
    id: 1,
    eyebrow: "Core module",
    title: "DSA Lab",
    description:
      "Curated coding practice with better pattern recall, repetition, and steady progress.",
    href: "/problemset",
    className: "md:col-span-1",
    thumbnail:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=3270&auto=format&fit=crop",
    content: (
      <ModuleGridContent
        label="Core module"
        title="Master 250 curated coding problems"
        description="ZenCode structures DSA preparation so you stop solving randomly and start building repeatable intuition across arrays, trees, graphs, dynamic programming, and more."
        points={["Pattern tracking", "Difficulty flow", "Streak-based practice"]}
      />
    ),
  },
  {
    id: 2,
    eyebrow: "OA prep",
    title: "Aptitude Arena",
    description:
      "Topic-wise quant, reasoning, and verbal prep aligned to assessment rounds.",
    href: "/aptitude",
    className: "md:col-span-1",
    thumbnail:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2940&auto=format&fit=crop",
    content: (
      <ModuleGridContent
        label="OA prep"
        title="Train for aptitude by topic, not guesswork"
        description="Move through aptitude systematically instead of skimming mixed sheets. Quant, logical reasoning, and verbal sections can all be practiced with clearer focus."
        points={["Quant", "Logical reasoning", "Verbal"]}
      />
    ),
  },
  {
    id: 3,
    eyebrow: "Concept prep",
    title: "Learning Library",
    description:
      "CS core videos, language lessons, and PDFs for faster interview revision.",
    href: "/learning",
    className: "md:col-span-1",
    thumbnail:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=3200&auto=format&fit=crop",
    content: (
      <ModuleGridContent
        label="Concept prep"
        title="Revise the theory that interviews still test"
        description="Use the learning section for DBMS, OS, CN, OOP, and language refreshers. Videos and PDFs help when coding prep starts exposing knowledge gaps."
        points={["Core CS", "Language prep", "Interview PDFs"]}
      />
    ),
  },
  {
    id: 4,
    eyebrow: "AI toolkit",
    title: "Resume + ATS Support",
    description:
      "Build sharper resumes and improve ATS quality with AI-guided feedback.",
    href: "/ai-analyzer",
    className: "md:col-span-1",
    thumbnail:
      "https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=3270&auto=format&fit=crop",
    content: (
      <ModuleGridContent
        label="AI toolkit"
        title="Polish the profile that gets you shortlisted"
        description="ZenCode helps you both create and analyze resumes. Improve structure, clarity, and ATS alignment before applications start going out."
        points={["ATS score", "Resume analysis", "Faster iteration"]}
      />
    ),
  },
  {
    id: 5,
    eyebrow: "Execution",
    title: "Resume Builder",
    description:
      "Create polished resumes quickly with templates built for fast tailoring.",
    href: "/resume-builder",
    className: "md:col-span-1",
    thumbnail:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=3270&auto=format&fit=crop",
    content: (
      <ModuleGridContent
        label="Execution"
        title="Build faster before each application cycle"
        description="When you need to tailor a resume quickly for roles, the builder gives you a cleaner workflow and a faster way to ship updates."
        points={["Templates", "Fast edits", "Role-specific changes"]}
      />
    ),
  },
  {
    id: 6,
    eyebrow: "Final rounds",
    title: "AI Mock Interview",
    description:
      "Practice answers and communication so knowledge turns into confident delivery.",
    href: "/mock-interview",
    className: "md:col-span-1",
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=3270&auto=format&fit=crop",
    content: (
      <ModuleGridContent
        label="Final rounds"
        title="Rehearse before the real conversation starts"
        description="Mock interviews help you sharpen clarity, tone, and structure across technical and behavioral questions so you sound practiced, not surprised."
        points={["Communication", "Answer structure", "Confidence reps"]}
      />
    ),
  },
];

export default function Homepage() {
  const heroRef = useRef(null);
  const journeyPinRef = useRef(null);
  const journeyCardRef = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeJourneyIndex, setActiveJourneyIndex] = useState(0);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-reveal",
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
        }
      );

      gsap.fromTo(
        ".dashboard-float",
        { y: 16, opacity: 0, scale: 0.985 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power2.out",
          delay: 0.16,
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  /* ── GSAP ScrollTrigger pin for journey stages ── */
  useEffect(() => {
    if (!journeyPinRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: journeyPinRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * (journeyStages.length - 1)}`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        onUpdate: (self) => {
          const nextIndex = Math.min(
            journeyStages.length - 1,
            Math.floor(self.progress * journeyStages.length)
          );
          setActiveJourneyIndex((prev) =>
            prev === nextIndex ? prev : nextIndex
          );
        },
      });
    }, journeyPinRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!journeyCardRef.current) return;

    gsap.fromTo(
      journeyCardRef.current,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }
    );
  }, [activeJourneyIndex]);

  const primaryHref = isAuthenticated ? "/problemset" : "/signup";
  const secondaryHref = isAuthenticated ? "/mock-interview" : "/login";
  const primaryLabel = isAuthenticated ? "Continue Practicing" : "Start With ZenCode";
  const secondaryLabel = isAuthenticated ? "Open Mock Interview" : "Sign In";
  const activeJourneyStage = journeyStages[activeJourneyIndex];
  const ActiveJourneyIcon = activeJourneyStage.icon;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-orange-500/20">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_70%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/20 to-transparent" />
      </div>

      <main className="relative z-10">
        {/* ── Full-screen hero + stats ── */}
        <section className="mt-16 flex h-[calc(100dvh-8rem)] flex-col justify-center gap-12 px-6 pb-2">
          {/* Main content — top */}
          <div
            ref={heroRef}
            className="container mx-auto grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center"
          >
            {/* Left copy */}
            <div className="space-y-4">
              <div className="hero-reveal brand-chip w-fit border-orange-400/20 bg-orange-500/8 text-orange-100">
                <span className="h-2 w-2 rounded-full bg-orange-300" />
                Complete Interview Prep System
              </div>

              <div className="hero-reveal space-y-3">
                <h1 className="max-w-[14ch] text-4xl font-semibold leading-tight tracking-[-0.04em] text-white lg:text-5xl">
                  One place to prepare for every interview round.
                </h1>
                <p className="max-w-lg text-sm leading-6 text-neutral-300">
                  DSA mastery, aptitude, learning videos, AI resume tools, and mock interviews — one cleaner workflow.
                </p>
              </div>

              <div className="hero-reveal flex flex-wrap gap-3">
                <Link
                  to={primaryHref}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-7 py-3 text-sm font-semibold text-white transition-colors hover:from-orange-400 hover:to-orange-300"
                >
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={secondaryHref}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-400/18 bg-orange-500/8 px-7 py-3 text-sm font-medium text-neutral-100 transition-colors hover:bg-orange-500/12"
                >
                  {secondaryLabel}
                </Link>
              </div>
            </div>

            {/* Right dashboard card */}
            <div className="dashboard-float">
              <div className="surface-card relative overflow-hidden rounded-[1.8rem] border-orange-400/10 p-4">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(249,115,22,0.07),transparent_20%)]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/20 to-transparent" />

                <div className="relative z-10">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.28em] text-orange-200/70">Weekly Control Room</div>
                      <h2 className="mt-1 text-base font-semibold tracking-tight text-white">
                        Your prep stack, one clean dashboard.
                      </h2>
                    </div>
                    <div className="shrink-0 rounded-full border border-emerald-400/18 bg-emerald-400/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                      Placement mode
                    </div>
                  </div>

                  {/* Momentum strip */}
                  <div className="mt-3 flex items-center justify-between rounded-[1.2rem] border border-orange-400/10 bg-black/50 px-4 py-2.5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">This Week</p>
                      <p className="mt-0.5 text-sm font-semibold text-white">Crack the OA, revise CS, polish the pitch.</p>
                    </div>
                    <div className="rounded-xl border border-orange-400/16 bg-orange-500/10 px-3 py-2 text-right">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-orange-200/75">Momentum</div>
                      <div className="text-xl font-semibold text-white">81%</div>
                    </div>
                  </div>

                  {/* Module rows */}
                  <div className="mt-3 space-y-2">
                    {dashboardModules.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.name}
                          className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-orange-400/10 bg-black/50">
                              <Icon className="h-4 w-4 text-orange-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                                {item.name}
                                {index < 2 && (
                                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                                    active
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-neutral-500">{item.detail}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">Progress</div>
                            <div className="text-xs font-semibold text-white">{item.metric}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stats strip — pinned to the bottom of the 100vh hero */}
          <div className="container mx-auto">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {proofStats.map((stat) => (
                <div
                  key={stat.label}
                  className="surface-card hero-reveal rounded-xl border-orange-400/10 p-3"
                >
                  <div className="text-lg font-semibold tracking-tight text-white">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-orange-200/70">
                    {stat.label}
                  </div>
                  <p className="mt-1 text-[10px] leading-snug text-neutral-400 line-clamp-2">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="modules" className="container mx-auto mt-28 px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="brand-chip mx-auto w-fit border-orange-400/20 bg-orange-500/8 text-orange-100">
              <span className="h-2 w-2 rounded-full bg-orange-300" />
              Everything You Need
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
              Six modules. One interview-prep operating system.
            </h2>
            <p className="mt-5 text-lg leading-8 text-neutral-400">
              Each part of ZenCode solves a real bottleneck in the hiring process, and the grid below lets the product story feel more tactile and visual.
            </p>
          </div>

          <LayoutGridDemo cards={moduleGridCards} className="mt-14" />
        </section>

        {/* Journey section – pinned by GSAP ScrollTrigger */}
        <section
          ref={journeyPinRef}
          id="roadmap"
          className="relative flex min-h-screen items-center mt-28"
        >
          <div className="container mx-auto px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[0.88fr_1.12fr]">
              <div>
                <div className="brand-chip w-fit border-orange-400/20 bg-orange-500/8 text-orange-100">
                  <span className="h-2 w-2 rounded-full bg-orange-300" />
                  Prep Journey
                </div>
                <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
                  ZenCode is designed around the real interview sequence.
                </h2>
                <p className="mt-5 text-lg leading-8 text-neutral-400">
                  Keep scrolling — the journey card advances stage by stage. Only one phase is in focus at a time.
                </p>

                <div className="surface-card mt-8 rounded-[1.8rem] border-orange-400/10 p-6">
                  <div className="flex items-center gap-3 text-sm font-medium text-neutral-200">
                    <ZenCodeMark className="h-10 w-10" />
                    One calmer system for prep that usually feels fragmented.
                  </div>
                </div>
              </div>

              <div>
                <div className="surface-card rounded-[2rem] border-orange-400/10 p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    {journeyStages.map((stage, index) => (
                      <button
                        key={stage.step}
                        type="button"
                        onClick={() => setActiveJourneyIndex(index)}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-colors ${index === activeJourneyIndex
                          ? "border-orange-300/30 bg-orange-500/12 text-orange-100"
                          : "border-white/10 bg-white/[0.03] text-neutral-400 hover:text-white"
                          }`}
                      >
                        Stage {stage.step}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-300 transition-all duration-500"
                      style={{
                        width: `${((activeJourneyIndex + 1) / journeyStages.length) * 100}%`,
                      }}
                    />
                  </div>

                  <div
                    ref={journeyCardRef}
                    className="mt-6 rounded-[1.8rem] border border-orange-400/10 bg-black/35 p-6 md:p-8"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-400/12 bg-orange-500/10">
                          <ActiveJourneyIcon className="h-6 w-6 text-orange-300" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.26em] text-orange-200/70">
                            Stage {activeJourneyStage.step}
                          </div>
                          <h3 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
                            {activeJourneyStage.title}
                          </h3>
                          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
                            {activeJourneyStage.description}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-full border border-orange-400/16 bg-orange-500/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-orange-100">
                        In focus
                      </div>
                    </div>

                    <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <CheckCircle2 className="h-4 w-4 text-orange-300" />
                        Why this stage matters
                      </div>
                      <p className="mt-3 text-sm leading-7 text-neutral-400">
                        {activeJourneyStage.note}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="ai-stack" className="container mx-auto mt-28 px-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface-card rounded-[2rem] border-orange-400/10 p-7 md:p-8">
              <div className="brand-chip w-fit border-orange-400/20 bg-orange-500/8 text-orange-100">
                <span className="h-2 w-2 rounded-full bg-orange-300" />
                Why It Works
              </div>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                A prep product that feels more like a system than a page of links.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-400">
                Candidates usually bounce between YouTube, sheets, PDFs, resume tools, and interview practice. ZenCode brings those workflows together and keeps the design language focused so the platform feels serious, modern, and easy to trust.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {operatingSystemCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.title}
                      className="rounded-[1.6rem] border border-orange-400/10 bg-white/[0.03] p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-400/12 bg-orange-500/10">
                          <Icon className="h-5 w-5 text-orange-300" />
                        </div>
                        <div className="text-base font-semibold text-white">{card.title}</div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-neutral-400">{card.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="surface-card rounded-[2rem] border-orange-400/10 p-7 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div className="brand-chip w-fit border-orange-400/20 bg-orange-500/8 text-orange-100">
                  <span className="h-2 w-2 rounded-full bg-orange-300" />
                  Candidate Snapshot
                </div>
                <div className="shrink-0 rounded-full border border-orange-400/16 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-100">
                  All-in-one prep
                </div>
              </div>
              
              <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                If one weak area is blocking you, ZenCode gives it a home.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-400">
                A connected prep environment designed to catch your blind spots across every interview stage, ensuring you don't drop the ball on any specific round.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.6rem] border border-orange-400/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-400/12 bg-orange-500/10">
                      <Binary className="h-5 w-5 text-orange-300" />
                    </div>
                    <div className="text-base font-semibold text-white">Solve more, revise better</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-neutral-400">
                    Curated DSA and structured aptitude means stronger OA performance without jumping between platforms.
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-orange-400/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-400/12 bg-orange-500/10">
                      <BookOpenText className="h-5 w-5 text-orange-300" />
                    </div>
                    <div className="text-base font-semibold text-white">Learn with context</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-neutral-400">
                    Videos and PDFs keep fundamentals available when interview prep starts exposing concept gaps.
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-orange-400/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-400/12 bg-orange-500/10">
                      <FileSearch className="h-5 w-5 text-orange-300" />
                    </div>
                    <div className="text-base font-semibold text-white">Apply with confidence</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-neutral-400">
                    Resume creation and ATS analysis reduce the guesswork before you start sending applications.
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-orange-400/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-400/12 bg-orange-500/10">
                      <Mic className="h-5 w-5 text-orange-300" />
                    </div>
                    <div className="text-base font-semibold text-white">Speak like you have done this</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-neutral-400">
                    Mock interviews help turn knowledge into fluent, confident interview performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto mt-28 px-6">
          <div className="surface-card relative overflow-hidden rounded-[2.4rem] border-orange-400/10 p-8 md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(249,115,22,0.12),transparent_34%)]" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="brand-chip w-fit border-orange-400/20 bg-orange-500/8 text-orange-100">
                  <span className="h-2 w-2 rounded-full bg-orange-300" />
                  Start Where You Are
                </div>
                <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
                  Build a prep routine that covers the whole interview pipeline.
                </h2>
                <p className="mt-5 text-lg leading-8 text-neutral-400">
                  ZenCode is strongest when you use the modules together, but it is still helpful if you need to solve one immediate bottleneck first.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to={primaryHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-7 py-4 text-sm font-semibold text-white transition-colors hover:from-orange-400 hover:to-orange-300"
                >
                  {isAuthenticated ? "Continue Practicing" : "Create Your Account"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/ai-analyzer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-400/18 bg-orange-500/8 px-7 py-4 text-sm font-medium text-neutral-100 transition-colors hover:bg-orange-500/12"
                >
                  Try AI Resume Tools
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6">
          <Footer />
        </section>
      </main>
    </div>
  );
}
