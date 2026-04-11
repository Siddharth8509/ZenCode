import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/mock-interview/ui/tabs";
import { Button } from "@/components/mock-interview/ui/button";
import { cn } from "@/utils/utils";
import { TooltipButton } from "./tooltip-button";
import { RecordAnswer } from "./record-answer";
import { db } from "@/config/firebase.config";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";

export const QuestionSection = ({ questions, onSubmitInterview }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWebCam, setIsWebCam] = useState(false);
  const [activeTab, setActiveTab] = useState(questions[0]?.question);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [isRestoringProgress, setIsRestoringProgress] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;
  const { interviewId } = useParams();
  const hasRestoredInitialTab = useRef(false);

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    hasRestoredInitialTab.current = false;
  }, [interviewId]);

  useEffect(() => {
    const fetchSavedAnswers = async () => {
      if (!userId || !interviewId) return;

      setIsRestoringProgress(true);
      try {
        const answersQuery = query(
          collection(db, "userAnswers"),
          where("userId", "==", userId),
          where("mockIdRef", "==", interviewId)
        );
        const answersSnapshot = await getDocs(answersQuery);
        const savedQuestions = new Set(
          answersSnapshot.docs
            .map((doc) => doc.data()?.question)
            .filter(Boolean)
        );

        setAnsweredQuestions(savedQuestions);
      } catch (error) {
        console.log(error);
        toast.error("Unable to restore interview progress.");
      } finally {
        setIsRestoringProgress(false);
      }
    };

    fetchSavedAnswers();
  }, [interviewId, userId]);

  useEffect(() => {
    if (!questions?.length || hasRestoredInitialTab.current) return;

    const firstUnansweredQuestion = questions.find(
      (item) => !answeredQuestions.has(item.question)
    );

    setActiveTab(firstUnansweredQuestion?.question || questions[0]?.question);
    hasRestoredInitialTab.current = true;
  }, [questions, answeredQuestions]);

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const answeredCount = answeredQuestions.size;
  const completionPercentage = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;
  const currentIndex = questions.findIndex((q) => q.question === activeTab);

  const nextUnansweredQuestion = useMemo(() => {
    const currentQuestionIndex = questions.findIndex(
      (question) => question.question === activeTab
    );

    const unansweredAfterCurrent = questions
      .slice(currentQuestionIndex + 1)
      .find((question) => !answeredQuestions.has(question.question));

    return (
      unansweredAfterCurrent ||
      questions.find((question) => !answeredQuestions.has(question.question)) ||
      null
    );
  }, [activeTab, answeredQuestions, questions]);

  const handlePlayQuestion = (questionText) => {
    if (isPlaying) {
      stopSpeech();
      return;
    }

    if ("speechSynthesis" in window) {
      stopSpeech();
      const speech = new SpeechSynthesisUtterance(questionText);
      window.speechSynthesis.speak(speech);
      setIsPlaying(true);
      speech.onend = () => setIsPlaying(false);
    }
  };

  const moveToNextQuestion = (savedQuestion, updatedAnsweredQuestions) => {
    const currentQuestionIndex = questions.findIndex(
      (item) => item.question === savedQuestion
    );

    const unansweredAfterCurrent = questions
      .slice(currentQuestionIndex + 1)
      .find((item) => !updatedAnsweredQuestions.has(item.question));

    const fallbackQuestion = questions.find(
      (item) => !updatedAnsweredQuestions.has(item.question)
    );

    const nextQuestion = unansweredAfterCurrent || fallbackQuestion;

    if (nextQuestion) {
      setActiveTab(nextQuestion.question);
      return;
    }

    toast.success("Interview ready to submit", {
      description:
        "All available answers are saved. Click Submit Interview to view the feedback dashboard.",
    });
  };

  const handleAnswerSaved = ({
    question: savedQuestion,
    feedback,
    communicationFeedback,
  }) => {
    const updatedAnsweredQuestions = new Set(answeredQuestions);
    updatedAnsweredQuestions.add(savedQuestion);
    setAnsweredQuestions(updatedAnsweredQuestions);

    const spokenFeedback = communicationFeedback || feedback;

    if (spokenFeedback && "speechSynthesis" in window) {
      stopSpeech();
      const speech = new SpeechSynthesisUtterance(spokenFeedback);
      window.speechSynthesis.speak(speech);
      setIsPlaying(true);
      speech.onend = () => {
        setIsPlaying(false);
        moveToNextQuestion(savedQuestion, updatedAnsweredQuestions);
      };
      return;
    }

    moveToNextQuestion(savedQuestion, updatedAnsweredQuestions);
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/5 overflow-hidden animate-pop-in">
      <div className="border-b border-white/5 bg-black/20 p-5 md:p-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-orange-400">
              <DocumentTextIcon className="w-4 h-4" />
              Interview Progress
            </div>
            <h3 className="text-xl font-bold text-white">
              {answeredCount === questions.length
                ? "All questions are saved. Submit when you're ready."
                : "Submit any time after saving at least one answer."}
            </h3>
            <p className="text-sm text-neutral-400 max-w-2xl">
              {answeredCount} of {questions.length} questions saved.
              {answeredCount > 0
                ? " You can open the feedback page now or continue answering the remaining questions."
                : " Record your first answer to unlock the feedback page."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="secondary"
              disabled={!nextUnansweredQuestion || isRestoringProgress}
              onClick={() => {
                if (nextUnansweredQuestion) {
                  setActiveTab(nextUnansweredQuestion.question);
                }
              }}
              className="border border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10 hover:border-white/20"
            >
              <ArrowRightIcon className="w-4 h-4" />
              Next Unanswered
            </Button>

            <Button
              type="button"
              variant="secondary"
              disabled={answeredCount === 0}
              onClick={onSubmitInterview}
              className="bg-gradient-to-r from-orange-400 to-amber-500 text-black hover:from-orange-500 hover:to-amber-600 shadow-[0_0_18px_rgba(245,158,11,0.35)]"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Submit Interview
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="min-w-12 text-right text-xs font-black text-neutral-300">
            {completionPercentage}%
          </span>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
        orientation="vertical"
      >
        <TabsList className="bg-neutral-950 border-b border-white/5 w-full flex flex-wrap items-center justify-start gap-2 p-3 h-auto">
          {questions?.map((tab, index) => {
            const isAnswered = answeredQuestions.has(tab.question);

            return (
              <TabsTrigger
                key={tab.question}
                value={tab.question}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-300 border",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-black data-[state=active]:shadow-[0_0_15px_rgba(245,158,11,0.4)] data-[state=active]:border-orange-300/40",
                  "data-[state=inactive]:text-neutral-500 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/10 data-[state=inactive]:border-white/10",
                  isAnswered &&
                    "data-[state=inactive]:text-emerald-300 data-[state=inactive]:border-emerald-500/20 data-[state=inactive]:bg-emerald-500/5"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span>Q{index + 1}</span>
                  {isAnswered && <CheckCircleIcon className="w-3.5 h-3.5" />}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {questions?.map((tab, index) => {
          const isAnswered = answeredQuestions.has(tab.question);

          return (
            <TabsContent key={tab.question} value={tab.question} className="p-5 md:p-6 space-y-6 mt-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] uppercase tracking-widest font-black text-orange-400">
                      Question {index + 1} of {questions.length}
                    </span>

                    {index === currentIndex && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Current
                      </span>
                    )}

                    {isAnswered && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Saved
                      </span>
                    )}
                  </div>

                  <p className="text-base text-neutral-200 leading-relaxed font-medium">
                    {tab.question}
                  </p>
                </div>

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
                    isPlaying
                      ? "text-orange-400 border-orange-500/40 bg-orange-500/10"
                      : "text-neutral-400 hover:text-white hover:bg-white/10"
                  )}
                  onClick={() => handlePlayQuestion(tab.question)}
                />
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

              <RecordAnswer
                question={tab}
                isWebCam={isWebCam}
                setIsWebCam={setIsWebCam}
                onAnswerSaved={handleAnswerSaved}
                isAnswered={isAnswered}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
