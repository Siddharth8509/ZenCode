import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  Binary,
  LockKeyhole,
  Mail,
  Mic,
  Target,
} from "lucide-react";
import { loginUser } from "../authSlice";
import ZenCodeMark from "../components/ZenCodeMark";

const LoginSchema = z.object({
  emailId: z.string().email("Invalid email address"),
  password: z.string().min(8, "Please enter a valid password"),
});

const returnPoints = [
  {
    icon: Binary,
    title: "Your DSA roadmap is waiting",
    desc: "Pick up from your solved patterns and continue the next sprint.",
  },
  {
    icon: Target,
    title: "Aptitude and revision stay in sync",
    desc: "Keep OA prep moving without losing topic-wise momentum.",
  },
  {
    icon: Mic,
    title: "Mock interviews stay one click away",
    desc: "Jump back into communication practice when you need it most.",
  },
];

export default function Loginpage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [toast, setToast] = useState(null);
  const [loginPending, setLoginPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toastTimerRef = useRef(null);

  const pushToast = (payload) => {
    setToast(payload);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  useEffect(() => {
    if (isAuthenticated && !loginPending) {
      navigate("/problemset");
    }
  }, [isAuthenticated, loginPending, navigate]);

  useEffect(() => {
    const toastFromNav = location.state?.toast;
    if (toastFromNav) {
      pushToast(toastFromNav);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = (data) => {
    setLoginPending(true);

    dispatch(loginUser(data))
      .unwrap()
      .then(() => {
        pushToast({ type: "success", message: "Login successful. Redirecting..." });
        setTimeout(() => navigate("/problemset"), 900);
      })
      .catch((err) => {
        pushToast({ type: "error", message: err || "Login failed." });
        setLoginPending(false);
      });
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#050505] text-white selection:bg-orange-500/20">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.2),rgba(5,5,5,0.95))]" />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 top-24 z-50 animate-pop-in">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                : "border-rose-500/30 bg-rose-500/10 text-rose-100"
            }`}
          >
            <div className="font-semibold">
              {toast.type === "success" ? "Success" : "Error"}
            </div>
            <div className="mt-1 text-xs text-neutral-200/80">{toast.message}</div>
          </div>
        </div>
      )}

      {/* Main layout — two columns, vertically centered */}
      <div className="relative z-10 flex h-full items-center justify-center px-6 lg:px-12">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2">

          {/* Left — branding panel */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <ZenCodeMark className="h-10 w-10" />
              <span className="text-xs uppercase tracking-[0.32em] text-neutral-500">ZenCode</span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
              Jump back into the system you already started building.
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Your prep stack stays organized: DSA, aptitude, learning, resume review, and mock practice all in one place.
            </p>

            <div className="mt-6 space-y-3">
              {returnPoints.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <Icon className="h-4 w-4 text-orange-300" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{p.title}</div>
                      <p className="text-[13px] leading-5 text-neutral-500">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — login form */}
          <div className="flex items-center justify-center">
            <div className="surface-card w-full max-w-md rounded-[2rem] p-6 md:p-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to homepage
              </Link>

              <div className="brand-chip mt-5 w-fit">
                <span className="h-2 w-2 rounded-full bg-orange-300" />
                Sign In
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Continue your prep.
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-neutral-400">
                Sign in with the email you registered with.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3.5">
                <div className="group">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-500 transition-colors group-focus-within:text-orange-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Mail className="h-4 w-4 text-neutral-500 transition-colors group-focus-within:text-orange-300" />
                    </div>
                    <input
                      type="email"
                      autoComplete="email"
                      {...register("emailId")}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-black/35 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/40"
                    />
                  </div>
                  {errors.emailId && <p className="mt-1 text-xs text-red-400">{errors.emailId.message}</p>}
                </div>

                <div className="group">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-500 transition-colors group-focus-within:text-orange-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <LockKeyhole className="h-4 w-4 text-neutral-500 transition-colors group-focus-within:text-orange-300" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      {...register("password")}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-white/10 bg-black/35 py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-neutral-600 focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-500 transition-colors hover:text-white"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-neutral-400">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="peer h-3.5 w-3.5 appearance-none rounded border border-white/20 bg-black/35 checked:border-orange-500 checked:bg-orange-500"
                      />
                      <svg
                        className="pointer-events-none absolute h-2.5 w-2.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-xs">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative inline-flex items-center gap-2">
                    {loading ? "Signing you in..." : "Sign In"}
                  </span>
                </button>

                <p className="text-center text-sm text-neutral-500">
                  New to ZenCode?
                  <Link
                    to="/signup"
                    className="ml-2 font-semibold text-white transition-colors hover:text-orange-300"
                  >
                    Create your account
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
