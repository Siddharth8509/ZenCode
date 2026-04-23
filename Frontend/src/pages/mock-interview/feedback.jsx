import { db } from "@/config/firebase.config";
import { useSelector } from "react-redux";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/mock-interview/custom-bread-crumb";
import { Headings } from "@/components/mock-interview/headings";
import { InterviewPin } from "@/components/mock-interview/pin";
import { Button } from "@/components/mock-interview/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/mock-interview/ui/accordion";
import { cn } from "@/utils/utils";
import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

const FILLERS = [/\bum\b/gi, /\buh\b/gi, /\blike\b/gi, /\byou know\b/gi, /\bkind of\b/gi];
const STRUCTURE = [/\bfirst\b/gi, /\bsecond\b/gi, /\bthen\b/gi, /\bfinally\b/gi, /\bbecause\b/gi];
const IMPACT = [/\bbuilt\b/gi, /\bimproved\b/gi, /\boptimized\b/gi, /\breduced\b/gi, /\bincreased\b/gi];
const EXAMPLES = [/\bfor example\b/gi, /\bfor instance\b/gi, /\bspecifically\b/gi, /\bone example\b/gi];
const HEDGES = [/\bi think\b/gi, /\bmaybe\b/gi, /\bprobably\b/gi, /\bperhaps\b/gi];

const clampScore = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.max(0, Math.min(10, Number(numeric.toFixed(1))));
};

const average = (values) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const countWords = (text) => String(text || "").trim().split(/\s+/).filter(Boolean).length;
const countMatches = (text, patterns) =>
  patterns.reduce((sum, pattern) => sum + (String(text || "").match(pattern) || []).length, 0);

const listify = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

const uniq = (items, max = 3) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item || "").trim().toLowerCase();
    if (!key || seen.has(key) || seen.size >= max) return false;
    seen.add(key);
    return true;
  });
};

const getTone = (score) => (score >= 7 ? "text-emerald-300" : score >= 4 ? "text-amber-300" : "text-rose-300");
const getBarColor = (score) => {
  const value = Math.round(Number(score) || 0);
  if (value <= 3) return "from-rose-500 to-red-400";
  if (value <= 5) return "from-amber-500 to-yellow-400";
  if (value <= 7) return "from-sky-500 to-cyan-400";
  return "from-emerald-500 to-green-400";
};

const buildCommunication = (feed) => {
  const answer = String(feed.user_ans || "").trim();
  if (!answer) {
    return {
      score: clampScore(feed.communicationScore),
      feedback: "No spoken answer was recorded for this question yet.",
      tips: [
        "Record a spoken answer so pacing can be assessed.",
        "Use a beginning, middle, and end.",
        "Close with the key takeaway or result.",
      ],
      strengths: ["This question is still open for practice."],
      subs: { clarity: 0, structure: 0, confidence: 0 },
    };
  }

  const words = countWords(answer);
  const fillers = countMatches(answer, FILLERS);
  const structureHits = countMatches(answer, STRUCTURE);
  const impactHits = countMatches(answer, IMPACT);
  const exampleHits = countMatches(answer, EXAMPLES);
  const hedgeHits = countMatches(answer, HEDGES);
  const sentences = answer.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean).length;

  const clarity = clampScore(4 + (words >= 30 ? 1.2 : 0) + (sentences >= 2 ? 1.1 : 0) + (fillers <= 1 ? 1.2 : 0) + (exampleHits ? 0.8 : 0) - (fillers > 3 ? 1 : 0));
  const structure = clampScore(3.8 + Math.min(2.4, structureHits * 1.2) + (sentences >= 2 ? 1 : 0) + (exampleHits ? 0.6 : 0));
  const confidence = clampScore(4 + Math.min(2.5, impactHits) + (hedgeHits <= 1 ? 1.2 : 0) + (fillers === 0 ? 1 : 0) - Math.min(2, hedgeHits * 0.5));
  const fallbackScore = clampScore(average([clarity, structure, confidence]));

  const feedback =
    feed.communicationFeedback?.trim() ||
    [
      structureHits ? "Your answer has some helpful structure." : "Your answer would sound stronger with clearer signposting.",
      fillers <= 1 && hedgeHits <= 1 ? "The phrasing feels fairly direct." : "Reducing filler and hedge phrases would make the delivery sound more confident.",
      impactHits || exampleHits ? "Concrete detail makes the answer more believable." : "Add one concrete example or result to make the answer more persuasive.",
    ].join(" ");

  const tips = listify(feed.improvementTips);
  const strengths = listify(feed.strengths);

  return {
    score: clampScore(feed.communicationScore) || fallbackScore,
    feedback,
    tips: tips.length ? tips.slice(0, 3) : uniq([
      words < 30 ? "Stretch short answers into 2 to 4 sentences using a STAR-style flow." : "",
      structureHits ? "" : "Use signposts like first, because, and finally to organize your answer.",
      impactHits ? "" : "Mention your action and the result so the answer sounds more credible.",
      fillers > 1 || hedgeHits > 1 ? "Pause briefly instead of filling space with maybe, like, or I think." : "Finish with a concise summary sentence.",
    ]),
    strengths: strengths.length ? strengths.slice(0, 2) : uniq([
      structureHits ? "You organize ideas instead of listing them randomly." : "",
      impactHits || exampleHits ? "You bring in concrete detail, which adds credibility." : "",
      words >= 30 && words <= 120 ? "Your answer length is close to an interview-ready range." : "You stayed engaged with the question.",
    ], 2),
    subs: { clarity, structure, confidence },
  };
};

const RatingBar = ({ rating }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 10 }).map((_, index) => (
      <StarSolid
        key={index}
        className={cn("w-3.5 h-3.5", index < Math.round(rating) ? "text-amber-400" : "text-neutral-700")}
      />
    ))}
    <span className="ml-2 text-sm font-semibold text-white">
      {Number(rating).toFixed(1)}
      <span className="text-neutral-500">/10</span>
    </span>
  </div>
);

const MetricCard = ({ icon: Icon, label, value, helper, tone = "text-white" }) => (
  <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">{label}</span>
      <div className="rounded-xl border border-white/10 bg-white/5 p-2">
        <Icon className="w-5 h-5 text-orange-400" />
      </div>
    </div>
    <div className={cn("text-3xl font-black font-mono", tone)}>{value}</div>
    <p className="text-sm text-neutral-400">{helper}</p>
  </div>
);

const ScoreRow = ({ label, value, helper }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-neutral-500">{helper}</p>
      </div>
      <span className={cn("text-sm font-black", getTone(value))}>{Number(value).toFixed(1)}/10</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-white/5">
      <div className={cn("h-full rounded-full bg-gradient-to-r", getBarColor(value))} style={{ width: `${Math.max(0, Math.min(100, value * 10))}%` }} />
    </div>
  </div>
);

export const Feedback = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeFeed, setActiveFeed] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;

  useEffect(() => {
    if (!interviewId) return;

    const loadInterview = async () => {
      try {
        const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
        if (interviewDoc.exists()) {
          setInterview({ id: interviewDoc.id, ...interviewDoc.data() });
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadInterview();
  }, [interviewId]);

  useEffect(() => {
    if (!interviewId || !userId) return;

    const loadFeedbacks = async () => {
      setIsLoading(true);
      try {
        const feedbackQuery = query(
          collection(db, "userAnswers"),
          where("userId", "==", userId),
          where("mockIdRef", "==", interviewId)
        );
        const snapshot = await getDocs(feedbackQuery);
        setFeedbacks(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch (error) {
        console.log(error);
        toast("Error", { description: "Something went wrong. Please try again later." });
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedbacks();
  }, [interviewId, userId]);

  const detailedFeedbacks = useMemo(() => {
    const questionOrder = new Map(
      (interview?.questions || []).map((item, index) => [item.question, index])
    );

    return [...feedbacks]
      .sort((first, second) => {
        const firstOrder = questionOrder.has(first.question) ? questionOrder.get(first.question) : 999;
        const secondOrder = questionOrder.has(second.question) ? questionOrder.get(second.question) : 999;
        if (firstOrder !== secondOrder) return firstOrder - secondOrder;
        return (second.createdAt?.seconds || 0) - (first.createdAt?.seconds || 0);
      })
      .map((feed) => ({ ...feed, communication: buildCommunication(feed) }));
  }, [feedbacks, interview]);

  const totalQuestions = interview?.questions?.length || 0;
  const answeredCount = detailedFeedbacks.length;
  const completion = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const overallRating = clampScore(average(detailedFeedbacks.map((feed) => Number(feed.rating) || 0)));
  const bestRating = clampScore(Math.max(0, ...detailedFeedbacks.map((feed) => Number(feed.rating) || 0)));
  const communicationScore = clampScore(average(detailedFeedbacks.map((feed) => feed.communication.score || 0)));


  const communicationSummary = useMemo(() => {
    if (!detailedFeedbacks.length) {
      return {
        clarity: 0,
        structure: 0,
        confidence: 0,
        summary: "Answer at least one question to unlock communication coaching.",
        strengths: [],
        improvements: [],
      };
    }

    const clarity = clampScore(average(detailedFeedbacks.map((feed) => feed.communication.subs.clarity || 0)));
    const structure = clampScore(average(detailedFeedbacks.map((feed) => feed.communication.subs.structure || 0)));
    const confidence = clampScore(average(detailedFeedbacks.map((feed) => feed.communication.subs.confidence || 0)));
    const strengths = uniq(detailedFeedbacks.flatMap((feed) => feed.communication.strengths || []), 3);
    const improvements = uniq(detailedFeedbacks.flatMap((feed) => feed.communication.tips || []), 4);
    const avgScore = average([clarity, structure, confidence]);

    let summary =
      "Your ideas are there, but clearer organization and more direct phrasing will make your answers easier for an interviewer to follow.";
    if (avgScore >= 8) {
      summary =
        "Your delivery already sounds clear and composed. Keep sharpening examples and impact statements to make strong answers even more memorable.";
    } else if (avgScore >= 6) {
      summary =
        "Your answers are understandable, and a bit more structure plus stronger finishing lines will make them interview-ready more consistently.";
    }

    return { clarity, structure, confidence, summary, strengths, improvements };
  }, [detailedFeedbacks]);

  if (!interviewId) return <Navigate to="/mock-interview" replace />;
  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;

  return (
    <div className="flex flex-col w-full gap-8 py-5 animate-fade-in">
      <div className="flex items-center justify-between w-full">
        <CustomBreadCrumb
          breadCrumbPage="Feedback"
          breadCrumpItems={[
            { label: "Mock Interviews", link: "/mock-interview" },
            { label: interview?.position || "", link: `/mock-interview/interview/${interview?.id}` },
          ]}
        />
      </div>

      <div className="glass-panel rounded-[2rem] p-8 border border-white/10 flex flex-col xl:flex-row items-start gap-6 shadow-xl">
        <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)] shrink-0">
          <TrophyIcon className="w-12 h-12 text-orange-400" />
        </div>

        <div className="flex-1">
          <Headings
            title="Interview Feedback Dashboard"
            description="Review your technical performance, see how your communication sounded, and get clearer coaching on what to improve next."
          />

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Overall Score</span>
              <div className={cn("text-3xl font-black font-mono mt-1", getTone(overallRating))}>
                {overallRating.toFixed(1)}
                <span className="text-neutral-500 text-sm font-bold ml-1">/10</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Communication</span>
              <div className={cn("text-3xl font-black font-mono mt-1", getTone(communicationScore))}>
                {communicationScore.toFixed(1)}
                <span className="text-neutral-500 text-sm font-bold ml-1">/10</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Completion</span>
              <div className="text-3xl font-black font-mono mt-1 text-white">{completion}%</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full xl:w-auto">
          <Button
            asChild
            variant="secondary"
            className="bg-gradient-to-r from-orange-400 to-amber-500 text-black hover:from-orange-500 hover:to-amber-600 shadow-[0_0_18px_rgba(245,158,11,0.35)]"
          >
            <Link to={`/mock-interview/interview/${interviewId}`}>
              <DocumentTextIcon className="w-4 h-4" />
              Practice Again
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="border border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10 hover:border-white/20"
          >
            <Link to="/mock-interview">
              <ChartBarIcon className="w-4 h-4" />
              All Interviews
            </Link>
          </Button>
        </div>
      </div>

      {interview && <InterviewPin interview={interview} onMockPage />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon={ChartBarIcon}
          label="Answered"
          value={`${answeredCount}/${totalQuestions || answeredCount || 0}`}
          helper="Saved answers included in this report."
        />
        <MetricCard
          icon={ArrowTrendingUpIcon}
          label="Best Answer"
          value={`${bestRating.toFixed(1)}/10`}
          helper="Highest-scoring response in this interview."
          tone={getTone(bestRating)}
        />
        <MetricCard
          icon={SpeakerWaveIcon}
          label="Communication"
          value={`${communicationScore.toFixed(1)}/10`}
          helper="Clarity, structure, and confidence of delivery."
          tone={getTone(communicationScore)}
        />
        <MetricCard
          icon={CheckCircleIcon}
          label="Progress"
          value={`${completion}%`}
          helper="Percentage of generated questions you submitted."
        />
      </div>


      {/* ── Question Performance ── full width */}
      <div className="glass-panel rounded-[2rem] border border-white/10 p-6 md:p-7">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-bold text-white">Question Performance</h3>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {detailedFeedbacks.length > 0 ? detailedFeedbacks.map((feed, index) => (
            <div key={feed.id} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-neutral-300 leading-relaxed truncate">Q{index + 1}. {feed.question}</p>
                <span className={cn("text-sm font-black whitespace-nowrap", getTone(Number(feed.rating) || 0))}>
                  {(Number(feed.rating) || 0).toFixed(1)}/10
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r", getBarColor(feed.rating))}
                  style={{ width: `${Math.max(0, Math.min(100, (Number(feed.rating) || 0) * 10))}%` }}
                />
              </div>
            </div>
          )) : (
            <p className="text-sm text-neutral-500 md:col-span-2">Once you submit answers, this section will show how each question performed.</p>
          )}
        </div>
      </div>

      {/* ── Communication Coaching ── 2-column balanced */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Communication Scores */}
        <div className="glass-panel rounded-[2rem] border border-white/10 p-6 md:p-7">
          <Headings title="Communication Scores" description={communicationSummary.summary} isSubHeading />
          <div className="mt-6 space-y-5">
            <ScoreRow label="Clarity" value={communicationSummary.clarity} helper="Are your answers easy to understand on the first listen?" />
            <ScoreRow label="Structure" value={communicationSummary.structure} helper="Do your responses follow a clean interview-friendly order?" />
            <ScoreRow label="Confidence" value={communicationSummary.confidence} helper="Does your phrasing sound direct and grounded?" />
          </div>
        </div>

        {/* Right: Strengths & Improvements */}
        <div className="glass-panel rounded-[2rem] border border-white/10 p-6 md:p-7 space-y-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.24em] text-emerald-300">What Is Working</h3>
            {communicationSummary.strengths.length > 0 ? (
              <div className="mt-3 space-y-3">
                {communicationSummary.strengths.map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">Save a few answers to surface strengths here.</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.24em] text-orange-300">How To Improve</h3>
            {communicationSummary.improvements.length > 0 ? (
              <div className="mt-3 space-y-3">
                {communicationSummary.improvements.map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">More submitted answers will unlock personalized communication tips.</p>
            )}
          </div>
        </div>
      </div>

      <Headings
        title="Question-by-Question Feedback"
        description="Each answer includes technical review plus communication coaching, so you know both what to improve and how to say it better."
        isSubHeading
      />

      {detailedFeedbacks.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-4">
          {detailedFeedbacks.map((feed, index) => (
            <AccordionItem
              key={feed.id}
              value={feed.id}
              className={cn(
                "glass-panel rounded-2xl border overflow-hidden transition-all duration-300",
                activeFeed === feed.id
                  ? "border-orange-500/40 shadow-lg shadow-orange-900/20 bg-white/5"
                  : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
              )}
            >
              <AccordionTrigger
                onClick={() => setActiveFeed((current) => (current === feed.id ? "" : feed.id))}
                className="px-6 py-5 flex items-center gap-4 hover:no-underline text-left"
              >
                <span className={cn("flex items-center justify-center w-8 h-8 rounded-xl font-black shrink-0 transition-colors", activeFeed === feed.id ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-neutral-800 text-neutral-400 text-xs border border-white/5")}>
                  {index + 1}
                </span>
                <span className="flex-1 text-[15px] text-neutral-200 font-semibold leading-relaxed">{feed.question}</span>
                <RatingBar rating={Number(feed.rating) || 0} />
              </AccordionTrigger>

              <AccordionContent className="px-5 pb-5 space-y-4 border-t border-white/5">
                <div className="p-4 rounded-xl bg-green-950/20 border border-green-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-sm font-semibold text-green-300">Expected Answer</span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed">{feed.correct_ans}</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm font-semibold text-amber-300">Your Answer</span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed">{feed.user_ans || "No answer recorded."}</p>
                </div>

                <div className="p-5 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5 text-orange-400 shrink-0" />
                    <span className="text-sm font-bold text-orange-300 uppercase tracking-widest">Technical Feedback</span>
                  </div>
                  <p className="text-sm text-neutral-200 leading-relaxed font-medium">{feed.feedback}</p>
                </div>

                <div className="p-5 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <SpeakerWaveIcon className="w-5 h-5 text-sky-400 shrink-0" />
                      <span className="text-sm font-bold text-sky-300 uppercase tracking-widest">Communication Feedback</span>
                    </div>
                    <span className={cn("text-sm font-black whitespace-nowrap", getTone(feed.communication.score))}>
                      {feed.communication.score.toFixed(1)}/10
                    </span>
                  </div>

                  <p className="text-sm text-neutral-200 leading-relaxed">{feed.communication.feedback}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Strengths</p>
                      <div className="space-y-2">
                        {feed.communication.strengths.map((item, itemIndex) => (
                          <div key={`${item}-${itemIndex}`} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Improvement Tips</p>
                      <div className="space-y-2">
                        {feed.communication.tips.map((item, itemIndex) => (
                          <div key={`${item}-${itemIndex}`} className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-sm text-orange-100">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
          <p className="text-neutral-400 text-sm font-medium max-w-sm">
            No feedback recorded yet. Complete at least one answer in the interview to unlock this dashboard.
          </p>
        </div>
      )}
    </div>
  );
};
