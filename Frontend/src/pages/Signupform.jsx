import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../authSlice";
import { useEffect, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

// Schema
const signupSchema = z
  .object({
    firstname: z.string().min(3, "Please enter valid first name"),
    lastname: z.string().min(3, "Please enter valid last name"),
    emailId: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmedPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: "Passwords do not match",
    path: ["confirmedPassword"],
  });

export default function Signupform() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/problemset");
    }
  }, [isAuthenticated, navigate])

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, } = useForm({ resolver: zodResolver(signupSchema), });

  const onSubmit = (data) => {
    const { confirmedPassword, ...payload } = data;
    dispatch(registerUser(payload));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/20">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex items-center justify-center px-6 py-16 order-2 lg:order-1">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold">Create your account</h2>
              <p className="text-slate-400 text-sm mt-2">
                Join ZenCode and start your structured learning path.
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold hover:bg-white/10 transition-colors text-slate-300"
              >
                Sign up with Google
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold hover:bg-white/10 transition-colors text-slate-300"
              >
                Sign up with GitHub
              </button>
            </div>

            <div className="my-6 flex items-center gap-4 text-xs text-slate-500">
              <div className="h-px flex-1 bg-white/10" />
              OR
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">First Name</label>
                  <input
                    {...register("firstname")}
                    placeholder="John"
                    autoComplete="given-name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all placeholder:text-slate-400"
                  />
                  <p className="text-red-400 text-xs mt-1">{errors.firstname?.message}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Last Name</label>
                  <input
                    {...register("lastname")}
                    placeholder="Doe"
                    autoComplete="family-name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all placeholder:text-slate-400"
                  />
                  <p className="text-red-400 text-xs mt-1">{errors.lastname?.message}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Email</label>
                <input
                  type="email"
                  {...register("emailId")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all placeholder:text-slate-400"
                />
                <p className="text-red-400 text-xs mt-1">{errors.emailId?.message}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all placeholder:text-slate-400 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-red-400 text-xs mt-1">{errors.password?.message}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmedPassword")}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all placeholder:text-slate-400 pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-red-400 text-xs mt-1">{errors.confirmedPassword?.message}</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-lg rounded-xl shadow-[0_12px_30px_rgba(249,115,22,0.15)] hover:from-orange-600 hover:to-red-600 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 mt-4 disabled:opacity-70 disabled:grayscale"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>

              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/20 bg-white/5 text-orange-400 focus:ring-orange-400" />
                I agree to the Terms of Service and Privacy Policy.
              </label>

              <p className="text-center text-sm text-slate-400">
                Already have an account?
                <span className="ml-2 text-orange-400 hover:text-orange-300 font-semibold cursor-pointer" onClick={() => navigate("/login")}>
                  Sign in
                </span>
              </p>
            </form>
          </div>
        </div>

        <div className="relative hidden lg:flex items-center justify-center p-12 overflow-hidden order-1 lg:order-2">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-500/10 blur-[160px] rounded-full" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[60%] h-[60%] bg-rose-500/10 blur-[160px] rounded-full" />
          <div className="relative z-10 max-w-md space-y-6">
            <div className="text-sm uppercase tracking-[0.4em] text-slate-400">ZenCode</div>
            <h1 className="text-4xl font-semibold leading-tight">
              Build your interview runway with a guided path.
            </h1>
            <p className="text-slate-400">
              Structured learning, daily prompts, and curated practice for every level.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {["DSA roadmap", "Progress analytics", "Study rooms", "Mock interview mode"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
