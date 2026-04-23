import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  FolderOpenIcon,
  PlayCircleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import axiosClient from '../../../utils/axiosClient';
import { courseData as aptitudeCourseData } from '../data/courseData';
import { logicalCourseData } from '../data/logicalCourseData';
import { verbalCourseData } from '../data/verbalCourseData';
import { csCoreData } from '../data/csCoreData';

const COURSE_CONFIG = {
  aptitude: {
    data: aptitudeCourseData,
    pageTitle: 'Quantitative Aptitude Masterclass',
    accentClass: 'text-orange-400',
    accentBgClass: 'bg-orange-500',
    accentBorderClass: 'border-orange-500/20',
    accentSoftClass: 'bg-orange-500/10',
  },
  logical: {
    data: logicalCourseData,
    pageTitle: 'Logical Reasoning Masterclass',
    accentClass: 'text-amber-400',
    accentBgClass: 'bg-amber-500',
    accentBorderClass: 'border-amber-500/20',
    accentSoftClass: 'bg-amber-500/10',
  },
  verbal: {
    data: verbalCourseData,
    pageTitle: 'Verbal Ability Masterclass',
    accentClass: 'text-blue-400',
    accentBgClass: 'bg-blue-500',
    accentBorderClass: 'border-blue-500/20',
    accentSoftClass: 'bg-blue-500/10',
  },
  'cs-core': {
    data: csCoreData,
    pageTitle: 'CS Fundamentals Masterclass',
    accentClass: 'text-emerald-400',
    accentBgClass: 'bg-emerald-500',
    accentBorderClass: 'border-emerald-500/20',
    accentSoftClass: 'bg-emerald-500/10',
  },
};

const createEmptyProgress = () => ({
  watchedVideoIds: [],
  lastWatchedVideoId: '',
  lastWatchedTopic: '',
  updatedAt: null,
});

const Learn = () => {
  const navigate = useNavigate();
  const { courseType } = useParams();
  const resolvedCourseType = COURSE_CONFIG[courseType] ? courseType : 'aptitude';
  const courseConfig = COURSE_CONFIG[resolvedCourseType];
  const courseData = courseConfig.data;

  const allVideos = useMemo(
    () =>
      courseData.flatMap((module, moduleIndex) =>
        module.videos.map((video, videoIndex) => ({
          ...video,
          topic: module.topic,
          moduleIndex,
          videoIndex,
          videoKey: `${module.topic}::${video.youtubeId}`,
        }))
      ),
    [courseData]
  );

  const [activeVideoKey, setActiveVideoKey] = useState(allVideos[0]?.videoKey || '');
  const [courseProgress, setCourseProgress] = useState(createEmptyProgress);
  const [progressLoading, setProgressLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);

  const activeVideo = useMemo(
    () => allVideos.find((video) => video.videoKey === activeVideoKey) || null,
    [activeVideoKey, allVideos]
  );

  const watchedVideoIds = useMemo(
    () => (Array.isArray(courseProgress.watchedVideoIds) ? courseProgress.watchedVideoIds : []),
    [courseProgress.watchedVideoIds]
  );
  const watchedVideoSet = useMemo(() => new Set(watchedVideoIds), [watchedVideoIds]);
  const totalVideos = allVideos.length;
  const watchedCount = watchedVideoIds.length;
  const progressPercent = totalVideos ? Math.round((watchedCount / totalVideos) * 100) : 0;
  const activeVideoCompleted = activeVideo ? watchedVideoSet.has(activeVideo.videoKey) : false;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeVideoKey]);

  useEffect(() => {
    let isCancelled = false;

    const fetchLearningProgress = async () => {
      try {
        setProgressLoading(true);
        const { data } = await axiosClient.get(`/aptitude/learn/progress/${encodeURIComponent(resolvedCourseType)}`);

        if (isCancelled) return;

        const nextProgress = data.progress || createEmptyProgress();
        setCourseProgress(nextProgress);

        const resumeVideo =
          allVideos.find((video) => video.videoKey === nextProgress.lastWatchedVideoId) || allVideos[0] || null;
        setActiveVideoKey(resumeVideo?.videoKey || '');
      } catch (error) {
        if (isCancelled) return;
        console.error('Failed to load aptitude progress:', error);
        toast.error('Could not load your course progress.');
        setCourseProgress(createEmptyProgress());
        setActiveVideoKey(allVideos[0]?.videoKey || '');
      } finally {
        if (!isCancelled) {
          setProgressLoading(false);
        }
      }
    };

    fetchLearningProgress();

    return () => {
      isCancelled = true;
    };
  }, [resolvedCourseType, allVideos]);

  const playVideo = (video) => {
    setActiveVideoKey(video.videoKey);
  };

  const handleMarkCompleted = async () => {
    if (!activeVideo) return;

    const optimisticProgress = {
      ...courseProgress,
      watchedVideoIds: Array.from(new Set([...watchedVideoIds, activeVideo.videoKey])),
      lastWatchedVideoId: activeVideo.videoKey,
      lastWatchedTopic: activeVideo.topic,
      updatedAt: new Date().toISOString(),
    };

    setCourseProgress(optimisticProgress);
    setSavingProgress(true);

    try {
      const { data } = await axiosClient.put(`/aptitude/learn/progress/${encodeURIComponent(resolvedCourseType)}`, {
        videoId: activeVideo.videoKey,
        topicTitle: activeVideo.topic,
      });

      setCourseProgress(data.progress || optimisticProgress);
      toast.success(activeVideoCompleted ? 'Progress refreshed for this lecture.' : 'Lecture marked as completed.');
    } catch (error) {
      console.error('Failed to save aptitude progress:', error);
      toast.error(error.response?.data?.message || 'Could not save your progress.');
      setCourseProgress((previousProgress) => ({
        ...previousProgress,
        watchedVideoIds,
        lastWatchedVideoId: courseProgress.lastWatchedVideoId,
        lastWatchedTopic: courseProgress.lastWatchedTopic,
        updatedAt: courseProgress.updatedAt,
      }));
    } finally {
      setSavingProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all border border-white/5"
            title="Back to Learning Hub"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white leading-tight flex items-center gap-2">
              <AcademicCapIcon className={`w-6 h-6 ${courseConfig.accentClass}`} />
              {courseConfig.pageTitle}
            </h1>
            <p className="text-xs font-semibold text-neutral-500">Comprehensive Video Library</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[380px]">
          <div className="flex items-center justify-between gap-3 text-xs font-bold text-neutral-400">
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
              <FolderOpenIcon className={`w-4 h-4 ${courseConfig.accentClass}`} />
              {courseData.length} Modules Loaded
            </span>
            <span>{watchedCount}/{totalVideos} completed</span>
          </div>
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <div
                className={`h-full ${courseConfig.accentBgClass} transition-all duration-300`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              <span>Course Progress</span>
              <span>{progressLoading ? 'Syncing...' : `${progressPercent}%`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-[calc(100vh-80px)]">
        <div className="flex-1 flex flex-col min-w-0">
          {activeVideo ? (
            <>
              <div className="relative w-full rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] aspect-video bg-black flex-shrink-0 group">
                <div className="absolute inset-0 bg-neutral-900 animate-pulse -z-10 flex items-center justify-center">
                  <span className={`loading loading-spinner ${courseConfig.accentClass} loading-lg`}></span>
                </div>
                <iframe
                  className="absolute inset-0 w-full h-full z-10"
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="mt-6 flex-shrink-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 ${courseConfig.accentSoftClass} border ${courseConfig.accentBorderClass} ${courseConfig.accentClass} rounded-lg text-[10px] font-black uppercase tracking-widest mb-3`}>
                      <PlayCircleIcon className="w-4 h-4" /> Now Playing
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2 selection:bg-orange-500/30">
                      {activeVideo.title}
                    </h2>
                    <p className="text-sm font-semibold text-neutral-400 flex items-center gap-2">
                      From Module: <span className="text-white">{activeVideo.topic}</span>
                    </p>
                    <p className="mt-2 text-sm text-neutral-500">
                      {activeVideoCompleted
                        ? 'This lecture is already counted in your progress.'
                        : 'Mark this lecture complete when you finish it to update your course progress.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleMarkCompleted}
                    disabled={savingProgress || progressLoading}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                      activeVideoCompleted
                        ? 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
                        : `${courseConfig.accentBgClass} shadow-[0_0_18px_rgba(249,115,22,0.25)]`
                    }`}
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    {savingProgress ? 'Saving...' : activeVideoCompleted ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full aspect-video rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-neutral-500 p-8 text-center">
              <PlayCircleIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-bold text-white mb-2">No Video Selected</p>
              <p className="text-sm">Please select a video from the curriculum on the right.</p>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 flex flex-col h-[600px] lg:h-[calc(100vh-120px)] glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">
                Course Curriculum
              </h3>
              <span className={`text-xs font-bold ${courseConfig.accentClass}`}>
                {watchedCount}/{totalVideos}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar bg-black/20 p-2 space-y-2">
            {courseData.map((module, sectionIdx) => {
              const moduleVideoKeys = module.videos.map((video) => `${module.topic}::${video.youtubeId}`);
              const moduleCompletedCount = moduleVideoKeys.filter((videoKey) => watchedVideoSet.has(videoKey)).length;

              return (
                <div key={module.topic} className="mb-4 last:mb-0">
                  <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md px-4 py-3 rounded-xl border border-white/5 shadow-md mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-neutral-400">
                        {sectionIdx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-neutral-200">
                          {module.topic}
                        </h4>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                          {moduleCompletedCount}/{module.videos.length} complete
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-2 py-1 rounded max-w-fit">
                      {module.videos.length} videos
                    </span>
                  </div>

                  <div className="pl-4 pr-1 space-y-1 mt-1 border-l-2 border-white/5 ml-7">
                    {module.videos.map((video, idx) => {
                      const videoKey = `${module.topic}::${video.youtubeId}`;
                      const isPlaying = activeVideo?.videoKey === videoKey;
                      const isCompleted = watchedVideoSet.has(videoKey);

                      return (
                        <button
                          key={videoKey}
                          onClick={() => playVideo({ ...video, topic: module.topic, videoKey })}
                          className={`w-full group flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                            isPlaying
                              ? 'bg-white/10 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isPlaying ? (
                              <div className={`w-5 h-5 rounded-full ${courseConfig.accentBgClass} flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]`}>
                                <PlayIcon className="w-3 h-3 text-black ml-0.5" />
                              </div>
                            ) : isCompleted ? (
                              <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <div className="w-5 h-5 flex items-center justify-center font-bold text-[10px] text-neutral-500 group-hover:text-white transition-colors">
                                {idx + 1}.
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[13px] leading-snug line-clamp-2 ${
                                isPlaying
                                  ? `${courseConfig.accentClass} font-bold`
                                  : isCompleted
                                    ? 'text-emerald-300 font-medium'
                                    : 'text-neutral-400 font-medium group-hover:text-white'
                              }`}
                            >
                              {video.title}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
