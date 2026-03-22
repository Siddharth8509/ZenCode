import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { CustomBreadCrumb } from "@/components/mock-interview/custom-bread-crumb";
import { QuestionSection } from "@/components/mock-interview/question-section";
import { InformationCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export const MockInterviewPage = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const fetchInterview = async () => {
      if (interviewId) {
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
          if (interviewDoc.exists()) {
            setInterview({ id: interviewDoc.id, ...interviewDoc.data() });
          }
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchInterview();
  }, [interviewId, navigate]);

  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;
  if (!interviewId || !interview) {
    navigate("/mock-interview", { replace: true });
    return null;
  }

  return (
    <div className="flex flex-col w-full gap-6 py-5 animate-fade-in">
      {/* Breadcrumb */}
      <CustomBreadCrumb
        breadCrumbPage="Live Interview"
        breadCrumpItems={[
          { label: "Mock Interviews", link: "/mock-interview" },
          { label: interview?.position || "", link: `/mock-interview/interview/${interview?.id}` },
        ]}
      />

      {/* Tip banner */}
      <div className="glass-panel rounded-xl p-4 border border-sky-500/20 flex items-start gap-3 bg-sky-500/5">
        <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 shrink-0 mt-0.5">
          <InformationCircleIcon className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-sky-300 mb-1">How it works</h4>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Click the mic icon to start recording your answer. Once finished, your response will be evaluated by AI and you'll advance to the next question.
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400">Your video is never recorded or stored.</span>
          </div>
        </div>
      </div>

      {/* Interview session */}
      {interview?.questions && interview.questions.length > 0 && (
        <QuestionSection questions={interview.questions} />
      )}
    </div>
  );
};
