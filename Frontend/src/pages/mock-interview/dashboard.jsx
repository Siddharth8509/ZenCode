import { Headings } from "@/components/mock-interview/headings";
import { InterviewPin } from "@/components/mock-interview/pin";
import { db } from "@/config/firebase.config";
import { useSelector } from "react-redux";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { PlusIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SkeletonCard = () => (
  <div className="glass-panel rounded-xl p-5 space-y-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-neutral-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-neutral-800 rounded w-3/4" />
        <div className="h-3 bg-neutral-800/60 rounded w-full" />
        <div className="h-3 bg-neutral-800/60 rounded w-5/6" />
      </div>
    </div>
    <div className="flex gap-1.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-5 w-16 rounded-full bg-neutral-800" />
      ))}
    </div>
    <div className="h-px bg-neutral-800" />
    <div className="flex justify-between">
      <div className="h-3 w-24 bg-neutral-800 rounded" />
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => <div key={i} className="w-8 h-8 rounded bg-neutral-800" />)}
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;

  useEffect(() => {
    setLoading(true);
    const interviewQuery = query(
      collection(db, "interviews"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      interviewQuery,
      (snapshot) => {
        const interviewList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setInterviews(interviewList);
        setLoading(false);
      },
      (error) => {
        console.log("Error on fetching : ", error);
        toast.error("Error..", { description: "Something went wrong. Try again later." });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="min-h-[80vh] space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <MicrophoneIcon className="w-7 h-7 text-orange-400" />
          </div>
          <Headings
            title="Mock Interviews"
            description="AI-powered mock interviews to supercharge your preparation"
          />
        </div>

        <Link to="/mock-interview/create">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-black text-sm font-black transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transform hover:-translate-y-0.5 animate-pulse-soft">
            <PlusIcon className="w-5 h-5" />
            New Interview
          </button>
        </Link>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
        ) : interviews.length > 0 ? (
          interviews.map((interview) => (
            <InterviewPin key={interview.id} interview={interview} />
          ))
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center h-72 gap-4 animate-rise mt-8">
            <div className="p-8 rounded-[2rem] glass-panel border border-white/10 flex flex-col items-center gap-4 max-w-sm w-full text-center shadow-lg transition-transform hover:-translate-y-1">
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <SparklesIcon className="w-10 h-10 text-orange-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">No interviews yet</h3>
                <p className="text-sm text-neutral-400">
                  Create your first AI mock interview and start practicing today.
                </p>
              </div>
              <Link to="/mock-interview/create" className="w-full mt-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:bg-orange-500 text-orange-400 hover:text-black border border-orange-500/30 text-sm font-bold transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  <PlusIcon className="w-5 h-5" />
                  Create Interview
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
