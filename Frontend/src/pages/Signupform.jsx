import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  Binary,
  BrainCircuit,
  FileSearch,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { registerUser } from "../authSlice";
import ZenCodeMark from "../components/ZenCodeMark";

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

const launchModules = [
  {
    icon: Binary,
    title: "Curated DSA practice",
    desc: "Start solving the 250-question roadmap from day one.",
  },
  {
    icon: BrainCircuit,
    title: "Structured aptitude rounds",
    desc: "Practice quant, reasoning, and verbal by topic.",
  },
  {
    icon: FileSearch,
    title: "AI resume support",
    desc: "Build your profile and analyze ATS quality before applications.",
  },
];

export default function Signupform() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/problemset");
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data) => {
    const payload = {
      firstname: data.firstname,
      lastname: data.lastname,
      emailId: data.emailId,
      password: data.password,
    };

    dispatch(registerUser(payload));
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#050505] text-white selection:bg-orange-500/20">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_75%_20%,rgba(249,115,22,0.12),transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.18),rgba(5,5,5,0.95))]" />
      </div>

      {/* Main layout — two columns, vertically centered */}
      <div className="relative z-10 flex h-full items-center justify-center px-6 lg:px-12">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2">

          {/* Left — signup form */}
          <div className="flex items-center justify-center">
            <div className="surface-card w-full max-w-md rounded-[2rem] p-6 md:p-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to homepage
              </Link>

              <div className="brand-chip mt-4 w-fit">
                <span className="h-2 w-2 rounded-full bg-orange-300" />
                Create Account
              </div>
              <h2 className="mt-2.5 text-2xl font-semibold tracking-tight md:text-3xl">
                Set up your prep workspace.
              </h2>
              <p className="mt-1.5 text-sm leading-5 text-neutral-400">
                One account for DSA, aptitude, learning, resume tools, and AI mock interviews.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-2.5">
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                    {error}
                  </div>
                )}

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="group">
                    <label className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-500 transition-colors group-focus-within:text-orange-300">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserRound className="h-4 w-4 text-neutral-500 transition-colors group-focus-within:text-orange-300" />
                      </div>
                      <input
                        {...register("firstname")}
                        autoComplete="given-name"
                        placeholder="John"
                        className="w-full rounded-xl border border-white/10 bg-black/35 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/40"
                      />
                    </div>
                    {errors.firstname && <p className="mt-0.5 text-[11px] text-red-400">{errors.firstname.message}</p>}
                  </div>

                  <div className="group">
                    <label className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-500 transition-colors group-focus-within:text-orange-300">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserRound className="h-4 w-4 text-neutral-500 transition-colors group-focus-within:text-orange-300" />
                      </div>
                      <input
                        {...register("lastname")}
                        autoComplete="family-name"
                        placeholder="Doe"
                        className="w-full rounded-xl border border-white/10 bg-black/35 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/40"
                      />
                    </div>
                    {errors.lastname && <p className="mt-0.5 text-[11px] text-red-400">{errors.lastname.message}</p>}
                  </div>
                </div>

                <div className="group">
                  <label className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-500 transition-colors group-focus-within:text-orange-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-neutral-500 transition-colors group-focus-within:text-orange-300" />
                    </div>
                    <input
                      type="email"
                      {...register("emailId")}
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-black/35 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/40"
                    />
                  </div>
                  {errors.emailId && <p className="mt-0.5 text-[11px] text-red-400">{errors.emailId.message}</p>}
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="group">
                    <label className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-500 transition-colors group-focus-within:text-orange-300">
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <LockKeyhole className="h-4 w-4 text-neutral-500 transition-colors group-focus-within:text-orange-300" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        autoComplete="new-password"
                        placeholder="Create password"
                        className="w-full rounded-xl border border-white/10 bg-black/35 py-2 pl-9 pr-10 text-sm text-white placeholder:text-neutral-600 focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/40"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-500 transition-colors hover:text-white"
                      >
                        {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-0.5 text-[11px] text-red-400">{errors.password.message}</p>}
                  </div>

                  <div className="group">
                    <label className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-500 transition-colors group-focus-within:text-orange-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <LockKeyhole className="h-4 w-4 text-neutral-500 transition-colors group-focus-within:text-orange-300" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("confirmedPassword")}
                        autoComplete="new-password"
                        placeholder="Confirm password"
                        className="w-full rounded-xl border border-white/10 bg-black/35 py-2 pl-9 pr-10 text-sm text-white placeholder:text-neutral-600 focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/40"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-500 transition-colors hover:text-white"
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmedPassword && <p className="mt-0.5 text-[11px] text-red-400">{errors.confirmedPassword.message}</p>}
                  </div>
                </div>

                <label className="flex items-center gap-2.5 pt-0.5 text-sm text-neutral-400">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      defaultChecked
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
                  <span className="text-xs leading-4">
                    I agree to the Terms of Service and Privacy Policy.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative inline-flex items-center gap-2">
                    {loading ? "Creating your account..." : "Create Account"}
                  </span>
                </button>

                <p className="text-center text-sm text-neutral-500">
                  Already have an account?
                  <Link
                    to="/login"
                    className="ml-2 font-semibold text-white transition-colors hover:text-orange-300"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>

          {/* Right — branding panel */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <ZenCodeMark className="h-10 w-10" />
              <span className="text-xs uppercase tracking-[0.32em] text-neutral-500">ZenCode</span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
              Build your prep stack once. Use it across every round.
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Sign up and immediately unlock a cleaner system for coding, aptitude, revision, resume polish, and AI interview practice.
            </p>

            <div className="mt-6 space-y-3">
              {launchModules.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.title} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <Icon className="h-4 w-4 text-orange-300" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{m.title}</div>
                      <p className="text-[13px] leading-5 text-neutral-500">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
