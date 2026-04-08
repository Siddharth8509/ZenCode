import { db } from "@/config/firebase.config";
import { useSelector } from "react-redux";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/mock-interview/custom-bread-crumb";
import { Headings } from "@/components/mock-interview/headings";
import { InterviewPin } from "@/components/mock-interview/pin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/mock-interview/ui/accordion";
import { cn } from "@/utils/utils";
import {
  StarIcon,
  CheckCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  TrophyIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

const RatingBar = ({ rating }) => {
  const maxRating = 10;
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, i) => (
        <StarSolid
          key={i}
          className={cn("w-3.5 h-3.5", i < filled ? "text-amber-400" : "text-neutral-700")}
        />
      ))}
      <span className="ml-2 text-sm font-semibold text-white">{rating}<span className="text-neutral-500">/10</span></span>
    </div>
  );
};

export const Feedback = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeFeed, setActiveFeed] = useState("");
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;
  const missingInterviewId = !interviewId;

  useEffect(() => {
    if (missingInterviewId) return;

    const fetchInterview = async () => {
      try {
        const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
        if (interviewDoc.exists()) {
          setInterview({ id: interviewDoc.id, ...interviewDoc.data() });
        }
      } catch (error) {
        console.log(error);
      }
    };

    const fetchFeedbacks = async () => {
      setIsLoading(true);
      try {
        const querySnapRef = query(
          collection(db, "userAnswers"),
          where("userId", "==", userId),
          where("mockIdRef", "==", interviewId)
        );
        const querySnap = await getDocs(querySnapRef);
        setFeedbacks(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.log(error);
        toast("Error", { description: "Something went wrong. Please try again later." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
    fetchFeedbacks();
  }, [interviewId, missingInterviewId, userId]);

  const overAllRating = useMemo(() => {
    if (feedbacks.length === 0) return "0.0";
    const total = feedbacks.reduce((acc, fb) => acc + fb.rating, 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;

  const ratingNum = parseFloat(overAllRating);
  const ratingColor =
    ratingNum >= 7 ? "text-green-400" : ratingNum >= 4 ? "text-amber-400" : "text-red-400";

  if (missingInterviewId) return <Navigate to="/mock-interview" replace />;

  return (
    <div className="flex flex-col w-full gap-8 py-5 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between w-full">
        <CustomBreadCrumb
          breadCrumbPage="Feedback"
          breadCrumpItems={[
            { label: "Mock Interviews", link: "/mock-interview" },
            { label: interview?.position || "", link: `/mock-interview/interview/${interview?.id}` },
          ]}
        />
      </div>

      {/* Congratulations banner */}
      <div className="glass-panel rounded-[2rem] p-8 border border-white/10 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all animate-pop-in">
        <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)] shrink-0">
          <TrophyIcon className="w-12 h-12 text-orange-400" />
        </div>
        <div className="flex-1">
          <Headings title="Great job! 🎉" description="Your personalized AI feedback is ready. Review your answers, see the expected responses, and track areas to improve." />
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Overall Score</span>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className={cn("text-3xl font-black font-mono", ratingColor)}>
                {overAllRating}
              </span>
              <span className="text-neutral-500 text-sm font-bold ml-1">/ 10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interview pin */}
      {interview && <InterviewPin interview={interview} onMockPage />}

      {/* Section header */}
      <Headings title="Question-by-Question Feedback" isSubHeading />

      {/* Accordion */}
      {feedbacks.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-4">
          {feedbacks.map((feed, idx) => (
            <AccordionItem
              key={feed.id}
              value={feed.id}
              className={cn(
                "glass-panel rounded-2xl border overflow-hidden transition-all duration-300",
                activeFeed === feed.id
                  ? "border-orange-500/40 shadow-lg shadow-orange-900/20 bg-white/5"
                  : "border-white/10 hover:border-white/20 hover:bg-white-[0.02]"
              )}
            >
              <AccordionTrigger
                onClick={() => setActiveFeed(feed.id)}
                className="px-6 py-5 flex items-center gap-4 hover:no-underline text-left"
              >
                <span className={cn("flex items-center justify-center w-8 h-8 rounded-xl font-black shrink-0 transition-colors", activeFeed === feed.id ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-neutral-800 text-neutral-400 text-xs border border-white/5")}>
                  {idx + 1}
                </span>
                <span className="flex-1 text-[15px] text-neutral-200 font-semibold leading-relaxed">
                  {feed.question}
                </span>
                <RatingBar rating={feed.rating} />
              </AccordionTrigger>

              <AccordionContent className="px-5 pb-5 space-y-4 border-t border-white/5">
                {/* Expected answer */}
                <div className="p-4 rounded-xl bg-green-950/20 border border-green-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-sm font-semibold text-green-300">Expected Answer</span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed">{feed.correct_ans}</p>
                </div>

                {/* Your answer */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm font-semibold text-amber-300">Your Answer</span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed">{feed.user_ans || "No answer recorded."}</p>
                </div>

                {/* AI Feedback */}
                <div className="p-5 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-orange-400 shrink-0" />
                    <span className="text-sm font-bold text-orange-300 uppercase tracking-widest">AI Feedback</span>
                  </div>
                  <p className="text-sm text-neutral-200 leading-relaxed font-medium">{feed.feedback}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="glass-panel rounded-[2rem] p-12 border border-white/10 flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-full bg-white/5 border border-white/10">
            <ChevronDownIcon className="w-10 h-10 text-neutral-500" />
          </div>
          <p className="text-neutral-400 text-sm font-medium max-w-sm">No feedback recorded yet. Complete the interview first.</p>
        </div>
      )}
    </div>
  );
};
