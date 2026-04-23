import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ComputerDesktopIcon, DocumentTextIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import TopicCard from '../../pages/aptitude/components/TopicCard';

const LearningDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const sections = [
    {
      title: "CS Fundamentals",
      description: "Master OS, DBMS, and Computer Networks core concepts with complete masterclass videos.",
      icon: <ComputerDesktopIcon className="w-8 h-8" />,
      accentColor: "text-emerald-400",
      glowColor: "bg-emerald-500",
      path: "/learning/cs-core"
    },
    {
      title: "Study Materials",
      description: "Browse shared PDFs for offline studying, cheat sheets, and class notes. Admins can upload new material.",
      icon: <DocumentTextIcon className="w-8 h-8" />,
      accentColor: "text-blue-400",
      glowColor: "bg-blue-500",
      path: "/learning/materials"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-emerald-500/20">

      {/* Modern High-End Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[0%] left-[10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      <div className="relative z-10 w-full pt-4 pb-28 flex flex-col items-center px-4 md:px-8">
        
        {/* HERO HEADER */}
        <div className="text-center mb-16 relative max-w-4xl mx-auto mt-8 flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center px-5 py-1.5 rounded-full mb-6 bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400 flex items-center gap-2">
              <Squares2X2Icon className="w-4 h-4 text-emerald-400/80" />
              ZenCode Core Learning
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6 text-center text-white">
            Master the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
              Core Subjects.
            </span>
          </h1>

          <p className="text-neutral-400 text-base md:text-xl font-normal max-w-2xl mx-auto leading-relaxed text-center">
            Accelerate your engineering journey. Develop deep understanding of Operating Systems, Databases, and Networks.
          </p>
        </div>

        {/* SECTION 1: MASTERCLASSES & PDF VIEWER */}
        <div className="w-full max-w-7xl relative z-10 mb-20 group">
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
             <div>
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-white tracking-tight">
                   Learning Hub
                </h2>
                <p className="text-neutral-500 font-medium mt-2">Comprehensive curriculum and powerful study tools.</p>
             </div>
             {user?.role === 'admin' && (
               <button
                 onClick={() => navigate('/learning/admin')}
                 className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
               >
                 Admin Panel
               </button>
             )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((sec, i) => (
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

export default LearningDashboard;
