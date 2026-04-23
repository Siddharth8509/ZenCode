import { useSelector } from "react-redux";
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { toast } from "sonner";
import { generateMockInterviewFeedback } from "@/scripts";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

const MIN_ANSWER_LENGTH = 30;

const clampScore = (value) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return 0;
  return Math.max(0, Math.min(10, Number(numericValue.toFixed(1))));
};

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
};

const normalizeAiResponse = (result) => {
  const improvementTips = normalizeList(result?.improvementTips).slice(0, 3);
  const strengths = normalizeList(result?.strengths).slice(0, 2);

  return {
    ratings: clampScore(result?.ratings),
    feedback:
      typeof result?.feedback === "string" && result.feedback.trim()
        ? result.feedback.trim()
        : "Your answer covers part of the question, but it needs more depth and precision.",
    communicationScore: clampScore(result?.communicationScore),
    communicationFeedback:
      typeof result?.communicationFeedback === "string" &&
      result.communicationFeedback.trim()
        ? result.communicationFeedback.trim()
        : "Your delivery is understandable, but clearer structure and more confident phrasing would make the answer stronger.",
    improvementTips:
      improvementTips.length > 0
        ? improvementTips
        : [
            "Answer in a clear beginning, middle, and end.",
            "Add one concrete example from your experience.",
            "Finish by stating the result or impact.",
          ],
    strengths:
      strengths.length > 0
        ? strengths
        : ["You stayed on topic.", "You attempted to explain your thinking."],
  };
};

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
  onAnswerSaved,
  isAnswered = false,
}) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;
  const { interviewId } = useParams();

  const generateResult = async (questionText, correctAnswer, answerText) => {
    setIsAiGenerating(true);

    try {
      const aiResult = await generateMockInterviewFeedback({
        questionText,
        correctAnswer,
        answerText,
      });

      return normalizeAiResponse(aiResult);
    } catch (error) {
      console.log(error);
      toast("Error", {
        description:
          error?.response?.data?.error ||
          "An error occurred while generating feedback.",
      });

      return {
        ratings: 0,
        feedback: "Unable to generate detailed feedback for this answer.",
        communicationScore: 0,
        communicationFeedback:
          "Communication analysis is unavailable right now. Please try another answer.",
        improvementTips: [
          "Use a clearer beginning, middle, and end.",
          "Include one specific example.",
          "Summarize your final takeaway confidently.",
        ],
        strengths: ["You attempted the question.", "You stayed engaged in the interview."],
      };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const autoSaveAnswer = async (aiResult, answerText) => {
    setLoading(true);

    const currentQuestion = question.question;

    try {
      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("mockIdRef", "==", interviewId),
        where("question", "==", currentQuestion)
      );

      const querySnap = await getDocs(userAnswerQuery);

      if (!querySnap.empty) {
        toast.info("Already Answered", {
          description: "You have already answered this question.",
        });
        setUserAnswer("");
        stopSpeechToText();

        if (onAnswerSaved) {
          onAnswerSaved({
            question: currentQuestion,
            ...aiResult,
            alreadySaved: true,
          });
        }
        return;
      }

      await addDoc(collection(db, "userAnswers"), {
        mockIdRef: interviewId,
        question: question.question,
        correct_ans: question.answer,
        user_ans: answerText,
        feedback: aiResult.feedback,
        rating: aiResult.ratings,
        communicationScore: aiResult.communicationScore,
        communicationFeedback: aiResult.communicationFeedback,
        improvementTips: aiResult.improvementTips,
        strengths: aiResult.strengths,
        userId,
        createdAt: serverTimestamp(),
      });

      toast("Saved", {
        description: "Your answer has been saved and analyzed.",
      });

      setUserAnswer("");
      stopSpeechToText();

      if (onAnswerSaved) {
        onAnswerSaved({
          question: currentQuestion,
          ...aiResult,
          alreadySaved: false,
        });
      }
    } catch (error) {
      toast("Error", {
        description: "An error occurred while saving.",
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const recordUserAnswer = async () => {
    if (isAnswered) {
      toast.info("Already Submitted", {
        description: "This question is already saved. Move to the next one or submit the interview.",
      });
      return;
    }

    if (isRecording) {
      stopSpeechToText();

      const trimmedAnswer = userAnswer.trim();
      if (trimmedAnswer.length < MIN_ANSWER_LENGTH) {
        toast.error("Answer Too Short", {
          description: "Your answer should be more than 30 characters.",
        });
        return;
      }

      const aiResult = await generateResult(
        question.question,
        question.answer,
        trimmedAnswer
      );

      await autoSaveAnswer(aiResult, trimmedAnswer);
      return;
    }

    startSpeechToText();
  };

  const recordNewAnswer = () => {
    if (isAnswered) return;

    setUserAnswer("");
    if (isRecording) {
      stopSpeechToText();
    }
  };

  useEffect(() => {
    const combinedTranscript = results
      .filter((result) => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");

    setUserAnswer(combinedTranscript);
  }, [results]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4">
      <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center p-2 glass-panel rounded-[2rem] border border-white/10 shadow-[0_0_30px_rgba(249,115,22,0.1)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none" />
        {isWebCam ? (
          <WebCam
            onUserMedia={() => setIsWebCam(true)}
            onUserMediaError={() => setIsWebCam(false)}
            className="w-full h-full object-cover rounded-[1.5rem] relative z-10"
          />
        ) : (
          <WebcamIcon className="w-24 h-24 text-white/20 relative z-10" />
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <TooltipButton
          content={isWebCam ? "Turn Off" : "Turn On"}
          icon={
            isWebCam ? (
              <VideoOff className="min-w-5 min-h-5" />
            ) : (
              <Video className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setIsWebCam(!isWebCam)}
        />

        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          icon={
            isRecording ? (
              <CircleStop className="min-w-5 min-h-5" />
            ) : (
              <Mic className="min-w-5 min-h-5" />
            )
          }
          onClick={recordUserAnswer}
          disbaled={isAiGenerating || loading || isAnswered}
        />

        <TooltipButton
          content="Record Again"
          icon={<RefreshCw className="min-w-5 min-h-5" />}
          onClick={recordNewAnswer}
          disbaled={isAiGenerating || loading || isAnswered}
        />

        <TooltipButton
          content="Processing"
          icon={
            isAiGenerating || loading ? (
              <Loader className="min-w-5 min-h-5 animate-spin" />
            ) : (
              <Save className="min-w-5 min-h-5" />
            )
          }
          onClick={() => {}}
          disbaled={true}
        />
      </div>

      <div className="w-full mt-6 p-6 glass-panel rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-orange-400">
            Live Transcription
          </h2>
          {isAnswered && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
              Saved
            </span>
          )}
        </div>

        {isAnswered && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            This answer has already been submitted. You can move to another question or use Submit Interview to open the feedback dashboard.
          </div>
        )}

        <p className="text-[15px] text-neutral-300 leading-relaxed font-medium">
          {userAnswer ||
            (isAnswered
              ? "This response is already saved."
              : "Start recording to see your answer here...")}
        </p>

        {interimResult && (
          <p className="text-sm text-neutral-400">
            <strong className="text-white">Current Speech: </strong>
            {interimResult}
          </p>
        )}
      </div>
    </div>
  );
};
