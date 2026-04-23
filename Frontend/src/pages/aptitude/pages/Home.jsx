import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopicCard from '../components/TopicCard';
import { CalculatorIcon, LightBulbIcon, LanguageIcon, CpuChipIcon, BuildingOffice2Icon, Squares2X2Icon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const navigate = useNavigate();

  const masterclasses = [
    {
      title: "Quantitative Aptitude",
      description: "Watch master lectures for concept clarity in math.",
      icon: <CalculatorIcon className="w-8 h-8" />,
      accentColor: "text-orange-400",
      glowColor: "bg-orange-500",
      path: "/aptitude/learn/aptitude"
    },
    {
      title: "Logical Reasoning",
      description: "Master puzzles, direction sense, and pure logic.",
      icon: <LightBulbIcon className="w-8 h-8" />,
      accentColor: "text-amber-400",
      glowColor: "bg-amber-500",
      path: "/aptitude/learn/logical"
    },
    {
      title: "Verbal Ability",
      description: "Enhance vocabulary, grammar, and comprehension.",
      icon: <LanguageIcon className="w-8 h-8" />,
      accentColor: "text-blue-400",
      glowColor: "bg-blue-500",
      path: "/aptitude/learn/verbal"
    }
  ];

  const practice = [
    {
      title: "Interactive Practice Suite",
      description: "Instantly solve topic-wise questions across all categories with guided explanations.",
      icon: <CpuChipIcon className="w-8 h-8" />,
      accentColor: "text-rose-400",
      glowColor: "bg-rose-500",
      path: "/aptitude/platform"
    },
    {
      title: "Company Mock Papers",
      description: "Target top companies like TCS and Deloitte with rigorous, time-bound mock exams.",
      icon: <BuildingOffice2Icon className="w-8 h-8" />,
      accentColor: "text-red-500",
      glowColor: "bg-red-500",
      path: "/aptitude/mock"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-orange-500/20">

      {/* Modern High-End Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[0%] left-[10%] w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black" />
        
        {/* Subtle geometric dot grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      <div className="relative z-10 w-full pt-4 pb-28 flex flex-col items-center px-4 md:px-8">
        
        {/* HERO HEADER */}
        <div className="text-center mb-16 relative max-w-4xl mx-auto mt-8 flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center px-5 py-1.5 rounded-full mb-6 bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400 flex items-center gap-2">
              <Squares2X2Icon className="w-4 h-4 text-orange-400/80" />
              ZenCode Aptitude Matrix
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6 text-center text-white">
            Master the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400">
              Core Skills.
            </span>
          </h1>

          <p className="text-neutral-400 text-base md:text-xl font-normal max-w-2xl mx-auto leading-relaxed text-center">
            Accelerate your career placement. Develop unbreakable logic, perfect math, and deep verbal fluency.
          </p>
        </div>

        {/* SECTION 1: MASTERCLASSES */}
        <div className="w-full max-w-7xl relative z-10 mb-20 group">
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
             <div>
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-white tracking-tight">
                   Video Masterclasses
                </h2>
                <p className="text-neutral-500 font-medium mt-2">Comprehensive video curriculum instructed by experts.</p>
             </div>
             <span className="inline-flex items-center justify-center text-xs text-orange-400 font-black px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 uppercase tracking-widest whitespace-nowrap">
               3 Core Modules
             </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {masterclasses.map((sec, i) => (
              <TopicCard
                key={i}
                title={sec.title}
                description={sec.description}
                icon={sec.icon}
                accentColor={sec.accentColor}
                glowColor={sec.glowColor}
                onClick={() => navigate(sec.path)}
              />
            ))}
          </div>
        </div>

        {/* SECTION 2: PRACTICE SUITE */}
        <div className="w-full max-w-7xl relative z-10 group mt-8">
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
             <div>
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-white tracking-tight">
                   Practice & Evaluation
                </h2>
                <p className="text-neutral-500 font-medium mt-2">Apply your knowledge and prep under real-world pressure.</p>
             </div>
             <span className="inline-flex items-center justify-center text-xs text-rose-400 font-black px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 uppercase tracking-widest whitespace-nowrap">
               2 Test Arenas
             </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {practice.map((sec, i) => (
              <TopicCard
                key={i}
                title={sec.title}
                description={sec.description}
                icon={sec.icon}
                accentColor={sec.accentColor}
                glowColor={sec.glowColor}
                onClick={() => navigate(sec.path)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
