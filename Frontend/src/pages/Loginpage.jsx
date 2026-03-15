// This page handles sign-in and the small toast handoff after logout.
// It is designed to feel polished while still staying close to the auth slice underneath.
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";
import { loginUser } from "../authSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";


// Schema
const LoginSchema = z
  .object({
    emailId: z.string().email("Invalid email address"),
    password: z.string().min(8, "Please enter a valid password"),
  })

export default function Loginpage() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [toast, setToast] = useState(null);
  const [loginPending, setLoginPending] = useState(false);
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
  }, [isAuthenticated, loginPending, navigate])

  useEffect(() => {
    const toastFromNav = location.state?.toast;
    if (toastFromNav) {
      pushToast(toastFromNav);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const { register, handleSubmit, formState: { errors }, } = useForm({ resolver: zodResolver(LoginSchema), });
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

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/20">
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-pop-in">
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-2xl ${toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
              : "bg-rose-500/10 border-rose-500/30 text-rose-200"
              }`}
          >
            <div className="font-semibold">
              {toast.type === "success" ? "Success" : "Error"}
            </div>
            <div className="text-xs text-neutral-300 mt-1">{toast.message}</div>
          </div>
        </div>
      )}
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden lg:flex items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />
          <div className="absolute -top-24 left-[-20%] w-[60%] h-[60%] bg-orange-500/10 blur-[160px] rounded-full" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] bg-rose-500/10 blur-[160px] rounded-full" />
          <div className="relative z-10 max-w-md space-y-6">
            <div className="text-sm uppercase tracking-[0.4em] text-neutral-400">ZenCode</div>
            <h1 className="text-4xl font-semibold leading-tight">
              Practice with purpose. Build interview-ready skills.
            </h1>
            <p className="text-neutral-400">
              Daily prompts, company tracks, and structured DSA learning in one place.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {["Guided paths", "Timed mocks", "Progress tracking", "Community insights"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-neutral-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold">Sign in</h2>
              <p className="text-neutral-400 text-sm mt-2">Welcome back. Continue your learning streak.</p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold hover:bg-white/10 transition-colors text-neutral-300"
              >
                Continue with Google
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold hover:bg-white/10 transition-colors text-neutral-300"
              >
                Continue with GitHub
              </button>
            </div>

            <div className="my-6 flex items-center gap-4 text-xs text-neutral-500">
              <div className="h-px flex-1 bg-white/10" />
              OR
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2 block">Email</label>
                <input
                  {...register("emailId")}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all placeholder:text-neutral-400"
                />
                <p className="text-red-400 text-xs mt-1">{errors.emailId?.message}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all placeholder:text-neutral-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-red-400 text-xs mt-1">{errors.password?.message}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-neutral-500">
                  <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 text-orange-400 focus:ring-orange-400" />
                  Remember me
                </label>
                <span
                  className="text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                  onClick={() => navigate("/signup")}
                >
                  Create account
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-lg rounded-xl shadow-[0_12px_30px_rgba(249,115,22,0.15)] hover:from-orange-600 hover:to-red-600 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:grayscale"
              >
                {loading ? "Signing in..." : "Log In"}
              </button>

              <p className="text-center text-sm text-neutral-400">
                Don&apos;t have an account?
                <span className="ml-2 text-orange-400 hover:text-orange-300 font-semibold cursor-pointer" onClick={() => navigate("/signup")}>
                  Sign Up
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
