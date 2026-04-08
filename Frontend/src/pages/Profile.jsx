// Profile pulls together identity settings and progress analytics.
// It is where users can see momentum, edit basics, and change their password.
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile, resetPassword } from "../authSlice";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";
import axiosClient from "../utils/axiosClient";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase.config";
import {
  AcademicCapIcon,
  CodeBracketIcon,
  CalendarDaysIcon,
  FireIcon,
  PencilSquareIcon,
  KeyIcon,
  XMarkIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/solid";

const RING_RADIUS = 74;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const ActivityCalendar = ({ data }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentYear, currentMonth, i);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dateStr,
      dateObj: d,
      dayNum: i
    });
  }
  
  const dataMap = data.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const getLevel = (count, dateObj) => {
    const isToday = dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
    const isFuture = dateObj > today && !isToday;
    if (isFuture) {
      return 'bg-neutral-900/30 border border-white/5 opacity-40 cursor-default';
    }
    
    if (count === 0) return 'bg-[#0f0f0f] border border-white/5 shadow-inner hover:bg-neutral-800/80';
    if (count === 1) return 'bg-emerald-800 border border-emerald-500/30';
    if (count <= 3) return 'bg-emerald-600 border border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]';
    return 'bg-emerald-400 border border-emerald-300/80 shadow-[0_0_15px_rgba(52,211,153,0.5)]';
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center text-neutral-400 font-semibold mb-2">
        <span className="text-sm tracking-wide text-white font-bold">{monthName}</span>
        <div className="flex gap-2">
           <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </button>
           <button onClick={handleNextMonth} disabled={isCurrentMonth} className={`p-1 rounded-lg transition-colors ${isCurrentMonth ? 'text-neutral-700 cursor-not-allowed' : 'text-neutral-400 hover:bg-white/10 hover:text-white'}`}>
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
           </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map(wd => (
          <div key={wd} className="text-[10px] text-center text-neutral-500 uppercase tracking-wider font-bold mb-1">
            {wd}
          </div>
        ))}

        {days.map((item, i) => {
          if (!item) {
            return <div key={`empty-${i}`} className="h-8 lg:h-10 w-full rounded-md border border-transparent" />;
          }
          
          const count = dataMap[item.dateStr] || 0;
          const isToday = item.dateObj.getDate() === today.getDate() && item.dateObj.getMonth() === today.getMonth() && item.dateObj.getFullYear() === today.getFullYear();
          const isFuture = item.dateObj > today && !isToday;

          // Determine date text style -> bolder/whiter on days with counts or today
          let textClass = "text-neutral-500 font-medium text-xs";
          if (isFuture) textClass = "text-neutral-600 font-normal text-xs";
          else if (count > 0 || isToday) textClass = "text-white font-extrabold text-sm drop-shadow-md";

          return (
             <div 
               key={item.dateStr} 
               className={`h-8 lg:h-10 w-full rounded-md flex items-center justify-center 
                 ${getLevel(count, item.dateObj)} 
                 ${isToday ? 'outline outline-2 outline-offset-2 outline-emerald-500/50' : ''}
                 transition-all hover:scale-105 duration-200 relative group`}
             >
               <span className={textClass}>
                 {item.dayNum}
               </span>
               {!isFuture && (
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-900/95 backdrop-blur-md text-xs font-bold text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-white/10 shadow-2xl">
                    {count} questions on {item.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                 </div>
               )}
             </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Profile() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const userId = user?._id;

  const [solvedCount, setSolvedCount] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [recentSolved, setRecentSolved] = useState([]);
  const [solvedLoading, setSolvedLoading] = useState(true);
  const [solvedError, setSolvedError] = useState(null);

  const [lastInterview, setLastInterview] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const [animatedSolvedCount, setAnimatedSolvedCount] = useState(0);
  const [animatedPercent, setAnimatedPercent] = useState(0);

  const tweenValuesRef = useRef({ solved: 0, percent: 0 });

  const initials = `${user?.firstname?.[0] || ""}${user?.lastname?.[0] || ""}`.toUpperCase() || "U";

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // Edit Profile Form state
  const [editFormData, setEditFormData] = useState({
    firstname: "",
    lastname: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Reset Password Form state
  const [passFormData, setPassFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // Populate edit form when modal opens
  useEffect(() => {
    if (isEditProfileOpen && user) {
      setEditFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
      });
      setEditError("");
      setEditSuccess("");
    }
  }, [isEditProfileOpen, user]);

  useEffect(() => {
    if (isResetPasswordOpen) {
      setPassFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPassError("");
      setPassSuccess("");
    }
  }, [isResetPasswordOpen]);

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");

    try {
      await dispatch(updateProfile(editFormData)).unwrap();
      setEditSuccess("Profile updated successfully!");
      setTimeout(() => setIsEditProfileOpen(false), 2000);
    } catch (err) {
      setEditError(err || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError("");
    setPassSuccess("");

    if (passFormData.newPassword !== passFormData.confirmPassword) {
      setPassError("New passwords do not match");
      setPassLoading(false);
      return;
    }

    try {
      await dispatch(resetPassword({
        oldPassword: passFormData.oldPassword,
        newPassword: passFormData.newPassword
      })).unwrap();
      setPassSuccess("Password reset successfully!");
      setTimeout(() => setIsResetPasswordOpen(false), 2000);
    } catch (err) {
      setPassError(err || "Failed to reset password");
    } finally {
      setPassLoading(false);
    }
  };

  const progressPercent = useMemo(() => {
    if (!totalProblems) return 0;
    return Math.round((solvedCount / totalProblems) * 100);
  }, [solvedCount, totalProblems]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isCancelled = false;

    const fetchSolvedStats = async () => {
      try {
        const res = await axiosClient.get("/problem/user");
        if (isCancelled) return;

        setSolvedCount(Number(res.data?.solvedCount) || 0);
        setTotalProblems(Number(res.data?.totalProblems) || 0);
        setRecentSolved(Array.isArray(res.data?.recentSolved) ? res.data.recentSolved : []);
        setSolvedError(null);
      } catch (error) {
        if (isCancelled) return;
        const data = error?.response?.data;
        const message =
          (typeof data === "string" && data) ||
          data?.message ||
          "Unable to load solved stats.";
        setSolvedError(message);
      } finally {
        if (!isCancelled) {
          setSolvedLoading(false);
        }
      }
    };

    const fetchActivityAndInterview = async () => {
      try {
        const activityRes = await axiosClient.get("/problem/activity");
        if (!isCancelled) {
          setActivityData(Array.isArray(activityRes.data) ? activityRes.data : []);
          setActivityLoading(false);
        }

        if (userId) {
          const interviewsRef = collection(db, "interviews");
          const q = query(interviewsRef, where("userId", "==", userId));
          const querySnapshot = await getDocs(q);
          let docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          if (!isCancelled && docs.length > 0) {
            setLastInterview(docs[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching extra profile data:", err);
        if (!isCancelled) setActivityLoading(false);
      }
    };

    fetchSolvedStats();
    fetchActivityAndInterview();

    const intervalId = setInterval(fetchSolvedStats, 15000);

    const handleFocus = () => {
      fetchSolvedStats();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSolvedStats();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, userId]);

  useEffect(() => {
    const targetPercent = Math.max(0, Math.min(100, progressPercent));
    const targetSolved = Math.max(0, solvedCount);
    const values = tweenValuesRef.current;

    const tween = gsap.to(values, {
      solved: targetSolved,
      percent: targetPercent,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        setAnimatedSolvedCount(Math.round(values.solved));
        setAnimatedPercent(Math.round(values.percent));
      },
    });

    return () => {
      tween.kill();
    };
  }, [solvedCount, progressPercent]);

  const stats = [
    { label: "Problems Solved", value: animatedSolvedCount, icon: CodeBracketIcon, color: "text-emerald-400" },
    { label: "Total Problems", value: totalProblems, icon: AcademicCapIcon, color: "text-cyan-300" },
    { label: "Current Streak", value: "--", icon: FireIcon, color: "text-orange-400" },
    { label: "Days Active", value: "--", icon: CalendarDaysIcon, color: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/20">
      <Navbar />

      <div className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-[-10%] w-[50%] h-[50%] bg-orange-400/30 blur-[140px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-400/30 blur-[140px] rounded-full" />
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="glass-panel rounded-3xl border border-white/10 p-8 md:p-10 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative">
                <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-orange-500/40 to-red-500/30 flex items-center justify-center text-5xl font-bold text-white shadow-2xl border border-white/10">
                  {initials}
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 border-4 border-neutral-950 flex items-center justify-center">
                  <span className="text-[10px] font-bold">OK</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {user?.firstname} {user?.lastname}
                </h1>
                <p className="text-neutral-400 mt-1 text-lg">{user?.emailId}</p>
                <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs uppercase tracking-[0.25em] font-semibold">
                    {user?.role || "Member"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-400 text-xs">
                    <CalendarDaysIcon className="h-3.5 w-3.5" />
                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-panel rounded-2xl border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.15em] text-neutral-500">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-5">
                <AcademicCapIcon className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-semibold uppercase tracking-[0.15em] text-neutral-400">Solved Progress</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative h-44 w-44 shrink-0">
                  <svg className="h-44 w-44 -rotate-90" viewBox="0 0 180 180" role="img" aria-label="Solved progress">
                    <circle
                      cx="90"
                      cy="90"
                      r={RING_RADIUS}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.2)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r={RING_RADIUS}
                      fill="none"
                      stroke="url(#solvedProgressGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={RING_CIRCUMFERENCE * (1 - animatedPercent / 100)}
                    />
                    <defs>
                      <linearGradient id="solvedProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold">{animatedPercent}%</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">Complete</div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="text-4xl font-bold mb-1">{animatedSolvedCount}</div>
                  <div className="text-sm text-neutral-500 mb-5">
                    {totalProblems ? `${animatedSolvedCount} of ${totalProblems} questions solved` : "No problems created yet"}
                  </div>

                  <Link
                    to="/problemset"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continue Practice
                  </Link>
                </div>
              </div>

              {solvedLoading && (
                <p className="text-xs text-neutral-500 mt-4">Refreshing solved stats...</p>
              )}
              {solvedError && (
                <p className="text-xs text-rose-300 mt-4">{solvedError}</p>
              )}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 relative">
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm font-semibold uppercase tracking-[0.15em] text-neutral-400">Account Details</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors"
                    title="Edit Profile"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsResetPasswordOpen(true)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors"
                    title="Reset Password"
                  >
                    <KeyIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-xl bg-black/60 border border-white/5 p-4">
                  <div className="text-xs text-neutral-500 mb-1">First Name</div>
                  <div className="text-lg font-semibold">{user?.firstname || "--"}</div>
                </div>
                <div className="rounded-xl bg-black/60 border border-white/5 p-4">
                  <div className="text-xs text-neutral-500 mb-1">Last Name</div>
                  <div className="text-lg font-semibold">{user?.lastname || "--"}</div>
                </div>
                <div className="rounded-xl bg-black/60 border border-white/5 p-4">
                  <div className="text-xs text-neutral-500 mb-1">Email</div>
                  <div className="text-lg font-semibold break-all">{user?.emailId || "--"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 mt-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="text-sm font-semibold uppercase tracking-[0.15em] text-neutral-400">
                Last 5 Solved Questions
              </div>
              <span className="text-xs text-neutral-500">Updates every 15s</span>
            </div>

            {recentSolved.length > 0 ? (
              <div className="space-y-3">
                {recentSolved.map((item, index) => (
                  <div
                    key={`${item.problemId}-${item.solvedAt}-${index}`}
                    className="rounded-xl bg-black/60 border border-white/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate">{item.title}</div>
                        <div className="text-xs text-neutral-500">Solved</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-xs sm:text-sm text-neutral-400">
                        {item.solvedAt
                          ? new Date(item.solvedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          : "--"}
                      </div>
                      {item.problemId && (
                        <Link
                          to={`/problem/${item.problemId}`}
                          className="btn btn-xs bg-white/5 border-white/15 text-neutral-300 hover:bg-white/10"
                        >
                          Open
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-black/60 border border-white/5 p-4 text-neutral-400 text-sm">
                No solved questions yet.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-5">
                <CalendarDaysIcon className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold uppercase tracking-[0.15em] text-neutral-400">Activity Graph</span>
              </div>
              {activityLoading ? <p className="text-sm text-neutral-500">Loading activity...</p> : <ActivityCalendar data={activityData} />}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-5">
                <MicrophoneIcon className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-semibold uppercase tracking-[0.15em] text-neutral-400">Last Interview</span>
              </div>
              {lastInterview ? (
                <div className="flex flex-col h-full gap-4 pb-2">
                  <div className="p-5 rounded-2xl bg-black/60 border border-white/5 flex gap-5 items-center flex-1">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex flex-col items-center justify-center border border-white/10 shadow-lg">
                        <MicrophoneIcon className="h-6 w-6 text-blue-400 mb-0.5" />
                      </div>
                      <div>
                        <div className="text-lg font-bold tracking-wide">{lastInterview.jobRole || "Mock Interview"}</div>
                        <div className="text-sm text-neutral-400 mt-0.5 font-medium">
                          {lastInterview.createdAt ? new Date(lastInterview.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "--"}
                        </div>
                      </div>
                  </div>
                  <Link to={`/mock-interview/feedback/${lastInterview.id}`} className="btn w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-white/10 hover:border-white/20 text-sm font-bold text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center">
                     View Feedback Report
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-black/60 border border-white/5 text-neutral-400 text-sm h-full flex flex-col items-center justify-center min-h-[160px]">
                  No interviews completed yet.
                  <Link to="/mock-interview" className="mt-3 text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2">Practice Now</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 p-6 relative">
            <button
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-6">Edit Identity</h2>

            {editSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                {editSuccess}
              </div>
            )}
            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.firstname}
                  onChange={(e) => setEditFormData({ ...editFormData, firstname: e.target.value })}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.lastname}
                  onChange={(e) => setEditFormData({ ...editFormData, lastname: e.target.value })}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Email <span className="text-neutral-500">(Cannot be changed)</span></label>
                <input
                  type="email"
                  disabled
                  value={user?.emailId || ""}
                  className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2 text-sm text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 p-6 relative">
            <button
              onClick={() => setIsResetPasswordOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-6">Reset Password</h2>

            {passSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                {passSuccess}
              </div>
            )}
            {passError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {passError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passFormData.oldPassword}
                  onChange={(e) => setPassFormData({ ...passFormData, oldPassword: e.target.value })}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passFormData.newPassword}
                  onChange={(e) => setPassFormData({ ...passFormData, newPassword: e.target.value })}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passFormData.confirmPassword}
                  onChange={(e) => setPassFormData({ ...passFormData, confirmPassword: e.target.value })}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {passLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
