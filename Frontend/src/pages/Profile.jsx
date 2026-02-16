import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  TrophyIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  CalendarDaysIcon,
  FireIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

const TOTAL_PATH_QUESTIONS = 18;

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  const progress = useMemo(() => {
    const raw = localStorage.getItem("zencode-learning-progress");
    let checked = {};
    if (raw) {
      try {
        checked = JSON.parse(raw);
      } catch {
        checked = {};
      }
    }
    const count = Object.values(checked).filter(Boolean).length;
    return { count, percent: Math.round((count / TOTAL_PATH_QUESTIONS) * 100) };
  }, []);

  const initials = `${user?.firstname?.[0] || ""}${user?.lastname?.[0] || ""}`.toUpperCase() || "U";

  const stats = [
    { label: "Problems Solved", value: "—", icon: CodeBracketIcon, color: "text-emerald-400" },
    { label: "Current Streak", value: "—", icon: FireIcon, color: "text-orange-400" },
    { label: "Days Active", value: "—", icon: CalendarDaysIcon, color: "text-blue-400" },
    { label: "Rank", value: "—", icon: ChartBarIcon, color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/20">
      <Navbar />

      <div className="relative pt-28 pb-20 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-[-10%] w-[50%] h-[50%] bg-orange-400/30 blur-[140px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-400/30 blur-[140px] rounded-full" />
        </div>

        <div className="relative z-10 container mx-auto px-6">
          {/* Profile Header Card */}
          <div className="glass-panel rounded-3xl border border-white/10 p-8 md:p-10 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-orange-500/40 to-red-500/30 flex items-center justify-center text-5xl font-bold text-white shadow-2xl border border-white/10">
                  {initials}
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 border-4 border-slate-950 flex items-center justify-center">
                  <span className="text-[10px] font-bold">✓</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {user?.firstname} {user?.lastname}
                </h1>
                <p className="text-slate-400 mt-1 text-lg">{user?.emailId}</p>
                <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs uppercase tracking-[0.25em] font-semibold">
                    {user?.role || "Member"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs">
                    <CalendarDaysIcon className="h-3.5 w-3.5" />
                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-panel rounded-2xl border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.15em] text-slate-500">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Path Progress */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-5">
                <AcademicCapIcon className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Learning Path</span>
              </div>
              <div className="text-4xl font-bold mb-1">{progress.percent}%</div>
              <div className="text-sm text-slate-500 mb-4">{progress.count} of {TOTAL_PATH_QUESTIONS} questions completed</div>
              <div className="h-3 w-full rounded-full bg-white/10 border border-white/10 overflow-hidden mb-5">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <Link
                to="/learning-path"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue Learning →
              </Link>
            </div>

            {/* Compete Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <TrophyIcon className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Compete</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">See where you rank</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Compare your progress against other developers and climb the global leaderboard.
                </p>
              </div>
              <Link
                to="/leaderboard"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-semibold text-sm transition-all w-full"
              >
                <TrophyIcon className="h-4 w-4" />
                View Leaderboard
              </Link>
            </div>

            {/* Account Details — full width */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 lg:col-span-2">
              <div className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400 mb-5">Account Details</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-950/60 border border-white/5 p-4">
                  <div className="text-xs text-slate-500 mb-1">First Name</div>
                  <div className="text-lg font-semibold">{user?.firstname || "—"}</div>
                </div>
                <div className="rounded-xl bg-slate-950/60 border border-white/5 p-4">
                  <div className="text-xs text-slate-500 mb-1">Last Name</div>
                  <div className="text-lg font-semibold">{user?.lastname || "—"}</div>
                </div>
                <div className="rounded-xl bg-slate-950/60 border border-white/5 p-4">
                  <div className="text-xs text-slate-500 mb-1">Email</div>
                  <div className="text-lg font-semibold break-all">{user?.emailId || "—"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
