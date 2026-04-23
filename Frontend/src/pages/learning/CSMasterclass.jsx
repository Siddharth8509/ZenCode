import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlayCircleIcon, PlayIcon, AcademicCapIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import { csCoreData } from './data/csCoreData';

const CSMasterclass = () => {
    const navigate = useNavigate();

    // Set default active video to the first video of the first topic
    const [activeVideo, setActiveVideo] = useState(csCoreData[0]?.videos[0] || null);
    const [activeTopicId, setActiveTopicId] = useState(csCoreData[0]?.topic || "");

    useEffect(() => {
        // Scroll to top when video changes on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeVideo]);

    const playVideo = (video, topicTitle) => {
        setActiveVideo(video);
        setActiveTopicId(topicTitle);
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-black text-white selection:bg-emerald-500/30">
            {/* TOP NAVIGATION BAR */}
            <div className="sticky top-16 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/learning')}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all border border-white/5"
                        title="Back to Learning Hub"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white leading-tight flex items-center gap-2">
                            <AcademicCapIcon className="w-6 h-6 text-emerald-400" />
                            CS Fundamentals Masterclass
                        </h1>
                        <p className="text-xs font-semibold text-neutral-500">Comprehensive Video Library</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-neutral-400 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                    <FolderOpenIcon className="w-4 h-4 text-emerald-400" />
                    {csCoreData.length} Subjects Loaded
                </div>
            </div>

            <div className="max-w-[1700px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* LEFT: VIDEO PLAYER SECTION */}
                <div className="flex-1 flex flex-col min-w-0">
                    {activeVideo ? (
                        <>
                            {/* VIDEO CONTAINER */}
                            <div className="relative w-full rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] aspect-video bg-black flex-shrink-0 group">
                                <div className="absolute inset-0 bg-neutral-900 animate-pulse -z-10 flex items-center justify-center">
                                    <span className="loading loading-spinner text-emerald-500 loading-lg"></span>
                                </div>
                                <iframe
                                    className="absolute inset-0 w-full h-full z-10"
                                    src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                                    title={activeVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* CURRENT VIDEO DETAILS */}
                            <div className="mt-6 flex-shrink-0">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
                                    <PlayCircleIcon className="w-4 h-4" /> Now Playing
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2 selection:bg-emerald-500/30">
                                    {activeVideo.title}
                                </h2>
                                <p className="text-sm font-semibold text-neutral-400 flex items-center gap-2">
                                    From Subject: <span className="text-white">{activeTopicId}</span>
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="w-full aspect-video rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-neutral-500 p-8 text-center">
                            <PlayCircleIcon className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-bold text-white mb-2">No Video Selected</p>
                            <p className="text-sm">Please select a video from the topic list on the right.</p>
                        </div>
                    )}
                </div>

                {/* RIGHT: CURRICULUM PLAYLIST SIDEBAR */}
                <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 flex flex-col h-[600px] lg:h-[calc(100vh-160px)] glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-white/10 bg-black/40 backdrop-blur-md">
                        <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                            Course Curriculum
                        </h3>
                    </div>

                    {/* SCROLLABLE LIST */}
                    <div className="flex-1 overflow-y-auto no-scrollbar bg-black/20 p-2 space-y-2">
                        {csCoreData.map((module, sectionIdx) => (
                            <div key={module.topic} className="mb-4 last:mb-0">
                                {/* TOPIC HEADER */}
                                <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md px-4 py-3 rounded-xl border border-white/5 shadow-md mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-neutral-400">
                                            {sectionIdx + 1}
                                        </div>
                                        <h4 className="font-bold text-sm text-neutral-200">
                                            {module.topic}
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-2 py-1 rounded max-w-fit">
                                        {module.videos.length} videos
                                    </span>
                                </div>

                                {/* VIDEOS LIST */}
                                <div className="pl-4 pr-1 space-y-1 mt-1 border-l-2 border-white/5 ml-7">
                                    {module.videos.map((vid, idx) => {
                                        const isPlaying = activeVideo?.youtubeId === vid.youtubeId;

                                        return (
                                            <button
                                                key={vid.youtubeId}
                                                onClick={() => playVideo(vid, module.topic)}
                                                className={`w-full group flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                                                    isPlaying 
                                                    ? "bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                                                    : "hover:bg-white/5 border border-transparent"
                                                }`}
                                            >
                                                <div className="mt-0.5">
                                                    {isPlaying ? (
                                                        <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                                                            <PlayIcon className="w-3 h-3 text-black ml-0.5" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-5 h-5 flex items-center justify-center font-bold text-[10px] text-neutral-500 group-hover:text-emerald-500 transition-colors">
                                                            {idx + 1}.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[13px] leading-snug line-clamp-2 ${
                                                        isPlaying 
                                                        ? "text-emerald-400 font-bold" 
                                                        : "text-neutral-400 font-medium group-hover:text-white"
                                                    }`}>
                                                        {vid.title}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CSMasterclass;
