import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/mock-interview/ui/tabs";
import { cn } from "@/utils/utils";
import { TooltipButton } from "./tooltip-button";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline";
import { RecordAnswer } from "./record-answer";

export const QuestionSection = ({ questions }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWebCam, setIsWebCam] = useState(false);
  const [activeTab, setActiveTab] = useState(questions[0]?.question);

  const stopSpeech = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handlePlayQuestion = (qst) => {
    if (isPlaying) {
      stopSpeech();
      return;
    }
    if ("speechSynthesis" in window) {
      stopSpeech();
      const speech = new SpeechSynthesisUtterance(qst);
      window.speechSynthesis.speak(speech);
      setIsPlaying(true);
      speech.onend = () => setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (activeTab && "speechSynthesis" in window) {
      stopSpeech();
      const speech = new SpeechSynthesisUtterance(activeTab);
      window.speechSynthesis.speak(speech);
      setIsPlaying(true);
      speech.onend = () => setIsPlaying(false);
    }
    return () => stopSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const advanceToNextQuestion = () => {
    const currentIndex = questions.findIndex((q) => q.question === activeTab);
    if (currentIndex !== -1 && currentIndex < questions.length - 1) {
      setActiveTab(questions[currentIndex + 1].question);
    }
  };

  const handleAnswerSaved = (feedback) => {
    if (feedback && "speechSynthesis" in window) {
      stopSpeech();
      const speech = new SpeechSynthesisUtterance(feedback);
      window.speechSynthesis.speak(speech);
      setIsPlaying(true);
      speech.onend = () => {
        setIsPlaying(false);
        advanceToNextQuestion();
      };
    } else {
      advanceToNextQuestion();
    }
  };

  const currentIndex = questions.findIndex((q) => q.question === activeTab);

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/5 overflow-hidden animate-pop-in">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
        orientation="vertical"
      >
        {/* Question number tabs */}
        <TabsList className="bg-neutral-950 border-b border-white/5 w-full flex flex-wrap items-center justify-start gap-2 p-3">
          {questions?.map((tab, i) => (
            <TabsTrigger
              key={tab.question}
              value={tab.question}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                "data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-red-900/30",
                "data-[state=inactive]:text-neutral-500 data-[state=inactive]:hover:text-neutral-300 data-[state=inactive]:hover:bg-neutral-800"
              )}
            >
              Q{i + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Question content */}
        {questions?.map((tab, i) => (
          <TabsContent key={i} value={tab.question} className="p-5 md:p-6 space-y-6">
            {/* Question card */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-xs font-bold text-red-400">
                    Question {i + 1} of {questions.length}
                  </span>
                  {i === currentIndex && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Current
                    </span>
                  )}
                </div>
                <p className="text-base text-neutral-200 leading-relaxed font-medium">
                  {tab.question}
                </p>
              </div>

              {/* TTS Toggle */}
              <TooltipButton
                content={isPlaying ? "Stop Reading" : "Read Aloud"}
                icon={
                  isPlaying ? (
                    <SpeakerXMarkIcon className="w-5 h-5" />
                  ) : (
                    <SpeakerWaveIcon className="w-5 h-5" />
                  )
                }
                buttonVariant="outline"
                buttonClassName={cn(
                  "shrink-0",
                  isPlaying ? "text-red-400 border-red-500/40" : "text-neutral-400"
                )}
                onClick={() => handlePlayQuestion(tab.question)}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            {/* Record answer component */}
            <RecordAnswer
              question={tab}
              isWebCam={isWebCam}
              setIsWebCam={setIsWebCam}
              onAnswerSaved={handleAnswerSaved}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
