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
import { useNavigate, useParams, Navigate } from "react-router-dom";
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
  const navigate = useNavigate();

  if (!interviewId) return <Navigate to="/mock-interview" replace />;

  useEffect(() => {
    if (!interviewId) return;

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
  }, [interviewId, navigate, userId]);

  const overAllRating = useMemo(() => {
    if (feedbacks.length === 0) return "0.0";
    const total = feedbacks.reduce((acc, fb) => acc + fb.rating, 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;

  const ratingNum = parseFloat(overAllRating);
  const ratingColor =
    ratingNum >= 7 ? "text-green-400" : ratingNum >= 4 ? "text-amber-400" : "text-red-400";

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
      <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row items-start md:items-center gap-6 animate-pop-in">
        <div className="p-4 rounded-2xl bg-red-600/10 border border-red-500/20 shrink-0">
          <TrophyIcon className="w-10 h-10 text-red-400" />
        </div>
        <div className="flex-1">
          <Headings title="Great job! 🎉" description="Your personalized AI feedback is ready. Review your answers, see the expected responses, and track areas to improve." />
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-neutral-400">Overall Score</span>
            <span className={cn("text-3xl font-bold font-mono", ratingColor)}>
              {overAllRating}
            </span>
            <span className="text-neutral-500 text-sm">/ 10</span>
          </div>
        </div>
      </div>

      {/* Interview pin */}
      {interview && <InterviewPin interview={interview} onMockPage />}

      {/* Section header */}
      <Headings title="Question-by-Question Feedback" isSubHeading />

      {/* Accordion */}
      {feedbacks.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-3">
          {feedbacks.map((feed, idx) => (
            <AccordionItem
              key={feed.id}
              value={feed.id}
              className={cn(
                "glass-panel rounded-xl border overflow-hidden transition-all duration-300",
                activeFeed === feed.id
                  ? "border-red-500/30 shadow-lg shadow-red-900/10"
                  : "border-white/5 hover:border-white/10"
              )}
            >
              <AccordionTrigger
                onClick={() => setActiveFeed(feed.id)}
                className="px-5 py-4 flex items-center gap-3 hover:no-underline text-left"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm text-neutral-200 font-medium leading-relaxed">
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
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-sm font-semibold text-red-300">AI Feedback</span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed">{feed.feedback}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="glass-panel rounded-xl p-8 border border-white/5 flex flex-col items-center gap-3 text-center">
          <ChevronDownIcon className="w-8 h-8 text-neutral-500" />
          <p className="text-neutral-400 text-sm">No feedback recorded yet. Complete the interview first.</p>
        </div>
      )}
    </div>
  );
};
