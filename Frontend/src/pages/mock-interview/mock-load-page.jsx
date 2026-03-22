import { db } from "@/config/firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/mock-interview/custom-bread-crumb";
import { InterviewPin } from "@/components/mock-interview/pin";
import WebCam from "react-webcam";
import {
  LightBulbIcon,
  SparklesIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export const MockLoadPage = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebCamEnabled, setIsWebCamEnabled] = useState(false);
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
    <div className="flex flex-col w-full gap-8 py-5 animate-fade-in">
      {/* Breadcrumb + Start button */}
      <div className="flex items-center justify-between w-full gap-4">
        <CustomBreadCrumb
          breadCrumbPage={interview?.position || ""}
          breadCrumpItems={[{ label: "Mock Interviews", link: "/mock-interview" }]}
        />
        <Link to={`/mock-interview/interview/${interviewId}/start`}>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-red-900/30 hover:shadow-red-900/50 animate-pulse-soft">
            <SparklesIcon className="w-4 h-4" />
            Start Interview
          </button>
        </Link>
      </div>

      {/* Interview info card */}
      {interview && <InterviewPin interview={interview} onMockPage />}

      {/* Info banner */}
      <div className="glass-panel rounded-xl p-4 border border-amber-500/20 flex items-start gap-3 bg-amber-500/5">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0 mt-0.5">
          <LightBulbIcon className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-300 mb-1">Before you begin</h4>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Enable your webcam and microphone to start. The interview consists of <strong className="text-white">8 questions</strong>.
            You&apos;ll receive a personalized AI report at the end.
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-500">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400">Your video is never recorded or stored.</span>
          </div>
        </div>
      </div>

      {/* Webcam section */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="w-full max-w-sm">
          <div className="relative w-full aspect-video glass-panel rounded-xl border border-neutral-800 overflow-hidden flex items-center justify-center">
            {isWebCamEnabled ? (
              <WebCam
                onUserMedia={() => setIsWebCamEnabled(true)}
                onUserMediaError={() => setIsWebCamEnabled(false)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-neutral-500">
                <div className="p-4 rounded-full bg-neutral-900 border border-neutral-800">
                  <VideoCameraSlashIcon className="w-10 h-10" />
                </div>
                <p className="text-sm">Camera is off</p>
              </div>
            )}
            {/* recording indicator */}
            {isWebCamEnabled && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 border border-white/10 text-xs text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </div>
            )}
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setIsWebCamEnabled(!isWebCamEnabled)}
            className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
              isWebCamEnabled
                ? "border-red-500/40 bg-red-950/20 text-red-400 hover:bg-red-950/40"
                : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800"
            }`}
          >
            {isWebCamEnabled ? (
              <>
                <VideoCameraSlashIcon className="w-4 h-4" />
                Disable Webcam
              </>
            ) : (
              <>
                <VideoCameraIcon className="w-4 h-4" />
                Enable Webcam
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
