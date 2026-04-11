import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import Loader from "../components/Loader";
import CodeEditor from "../components/CodeEditor";
import Timer from "../components/Timer";
import ZenCodeMark from "../components/ZenCodeMark";
import { runCodeApi, submitCodeApi } from "../api/submission";

const getErrorMessage = (error, fallback) => {
    const sanitizeMessage = (value) => {
        if (typeof value !== "string" || !value.trim()) return null;
        if (/<\/?[a-z][\s\S]*>/i.test(value) || /Cannot GET/i.test(value)) {
            return fallback;
        }

        return value;
    };

    const directMessage = sanitizeMessage(error);
    if (directMessage) return directMessage;
    if (error?.message && !error?.response) return error.message;
    const data = error?.response?.data;
    const responseMessage = sanitizeMessage(data);
    if (responseMessage) return responseMessage;
    if (data?.message) return sanitizeMessage(data.message) || fallback;
    return fallback;
};

export default function Problempage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("cpp");
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState(null);
    const [submissionPopup, setSubmissionPopup] = useState(null);

    // Problem sequence for next/prev
    const [allProblemIds, setAllProblemIds] = useState([]);
    const currentIndex = allProblemIds.indexOf(id);
    const hasNextProblem = currentIndex !== -1 && currentIndex < allProblemIds.length - 1;
    const hasPreviousProblem = currentIndex > 0;
    const userInitial = user?.firstname?.[0]?.toUpperCase() || user?.emailId?.[0]?.toUpperCase() || "U";
    const userName = user?.firstname || "Profile";
    const submissionStatus = String(submissionPopup?.problemStatus || submissionPopup?.status || "").toLowerCase();
    const isAcceptedSubmission = submissionPopup?.type !== "error" && submissionStatus === "accepted";
    const isErroredSubmission = submissionPopup?.type === "error" || (submissionPopup?.type === "submit" && !isAcceptedSubmission);

    useEffect(() => {
        const fetchIds = async () => {
            try {
                const ids = [];
                let page = 1;
                let hasMore = true;

                while (hasMore) {
                    const res = await axiosClient.get(`/problem/getAllProblems?page=${page}`);
                    const fetchedIds = Array.isArray(res.data?.problems)
                        ? res.data.problems.map((problemDoc) => problemDoc?._id).filter(Boolean)
                        : [];

                    ids.push(...fetchedIds);
                    hasMore = Boolean(res.data?.hasMore);
                    page += 1;
                }

                setAllProblemIds(ids);
            } catch (err) {
                console.error("Failed to fetch problem IDs", err);
            }
        };
        fetchIds();
    }, []);

    useEffect(() => {
        const fetchProblem = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoints = [
                    `/problem/problemById/${id}`,
                    `/problem/getProblemById/${id}`,
                ];
                let res = null;
                let lastNotFoundError = null;

                for (const endpoint of endpoints) {
                    try {
                        res = await axiosClient.get(endpoint);
                        break;
                    } catch (err) {
                        if (err?.response?.status === 404) {
                            lastNotFoundError = err;
                            continue;
                        }

                        throw err;
                    }
                }

                if (!res) {
                    throw lastNotFoundError || new Error("Problem not found");
                }

                setProblem(res.data);
                // Set initial code for the default language
                const initial = res.data.initialCode?.find(c => c.language === "cpp")?.code || "";
                setCode(initial);
            } catch (err) {
                setError(getErrorMessage(err, "Problem not found"));
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        const initial = problem?.initialCode?.find(c => c.language === newLang)?.code || "";
        setCode(initial);
    };

    const handleNextProblem = () => {
        if (hasNextProblem) {
            navigate(`/problem/${allProblemIds[currentIndex + 1]}`);
        }
    };

    const handlePreviousProblem = () => {
        if (hasPreviousProblem) {
            navigate(`/problem/${allProblemIds[currentIndex - 1]}`);
        }
    };

    const handleRun = async () => {
        setIsRunning(true);
        setOutput(null);
        try {
            const res = await runCodeApi(id, code, language);
            const results = Array.isArray(res) ? res : [];
            const firstFailure = results.find((item) => item?.statusId !== 3);

            setOutput({
                type: 'run',
                results,
                problemStatus: firstFailure
                    ? (firstFailure.status === "Wrong Answer" ? "wrong_answer" : "runtime_error")
                    : "accepted",
                runtime: results.reduce((total, item) => total + (Number(item?.time) || 0), 0),
                memory: results.reduce((peak, item) => Math.max(peak, Number(item?.memory) || 0), 0),
                errorMessage: firstFailure?.error || null,
            });
        } catch (error) {
            console.error(error);
            setOutput({ errorMessage: getErrorMessage(error, "Error running code"), type: 'error' });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsRunning(true);
        setOutput(null);
        try {
            const res = await submitCodeApi(id, code, language);
            const submission =
                res?.submission && typeof res.submission === "object"
                    ? res.submission
                    : res && typeof res === "object" && (
                        "status" in res ||
                        "problemStatus" in res ||
                        "runtime" in res ||
                        "testCasesPassed" in res
                    )
                        ? res
                        : null;

            if (submission && typeof submission === "object") {
                const safePayload = {
                    type: 'submit',
                    problemStatus: submission.problemStatus ? String(submission.problemStatus) : (submission.status ? String(submission.status) : null),
                    status: submission.status ? String(submission.status) : (submission.problemStatus ? String(submission.problemStatus) : null),
                    message: res?.message
                        ? String(res.message)
                        : submission.message
                            ? String(submission.message)
                            : "Problem submitted successfully",
                    errorMessage: submission.errorMessage ? String(submission.errorMessage) : null,
                    runtime: submission.runtime != null ? Number(submission.runtime) : null,
                    memory: submission.memory != null ? Number(submission.memory) : null,
                    testCasesPassed: submission.testCasesPassed != null ? Number(submission.testCasesPassed) : null,
                    testCasesTotal: submission.testCasesTotal != null ? Number(submission.testCasesTotal) : null,
                };
                setOutput(safePayload);
                setSubmissionPopup({ ...safePayload, language, timestamp: Date.now() });
            } else {
                const payload = { message: String(res || "Problem submitted successfully"), type: 'submit' };
                setOutput(payload);
                setSubmissionPopup({ ...payload, language, timestamp: Date.now() });
            }
        } catch (error) {
            console.error(error);
            const errPayload = { errorMessage: getErrorMessage(error, "Submission failed"), type: 'error' };
            setOutput(errPayload);
            setSubmissionPopup({ ...errPayload, language, timestamp: Date.now() });
        } finally {
            setIsRunning(false);
        }
    };

    if (loading) return <Loader message="Analyzing problem constraints..." />;
    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
            <h2 className="text-2xl font-bold text-rose-500 mb-4">{error}</h2>
            <button onClick={() => navigate('/problemset')} className="btn btn-outline border-white/20 text-white">
                Back to Problem Set
            </button>
        </div>
    );

    return (
        <>
            <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-black">
                <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 bg-black/95 px-3 md:px-4 border-b border-neutral-900 relative z-20 shrink-0 backdrop-blur-md">
                    <div className="flex min-w-0 items-center gap-2 md:gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/problemset")}
                            className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-neutral-950/80 transition-all hover:border-orange-400/30 hover:bg-neutral-900"
                            title="Back to problem set"
                        >
                            <ZenCodeMark className="h-7 w-7 transition-transform duration-300 group-hover:scale-105" />
                        </button>

                        <div className="join border border-white/5 rounded-xl overflow-hidden bg-white/5">
                            <button
                                className="btn btn-sm btn-ghost join-item text-neutral-400 hover:bg-white/5 disabled:opacity-40"
                                onClick={handlePreviousProblem}
                                disabled={!hasPreviousProblem}
                                title="Previous problem"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <button
                                className="btn btn-sm btn-ghost join-item text-neutral-400 hover:bg-white/5 disabled:opacity-40"
                                onClick={handleNextProblem}
                                disabled={!hasNextProblem}
                                title="Next problem"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>

                        <div className="hidden sm:block h-6 w-px bg-white/10" />
                        <h2 className="hidden sm:block truncate text-sm font-semibold text-neutral-200 max-w-[150px] md:max-w-[220px] lg:max-w-[360px]">
                            {problem.title}
                        </h2>
                    </div>

                    <div className="flex items-center justify-center gap-2 md:gap-3">
                        <button
                            className={`btn btn-sm bg-neutral-900 hover:bg-neutral-800 text-white border-none gap-2 transition-all duration-300 ${isRunning ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.97]"}`}
                            onClick={handleRun}
                            disabled={isRunning}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                            </svg>
                            {isRunning ? "Running..." : "Run"}
                        </button>

                        <button
                            className={`btn btn-sm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-none gap-2 px-4 md:px-6 shadow-2xl transition-all duration-300 ${isRunning ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.97]"}`}
                            onClick={handleSubmit}
                            disabled={isRunning}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                            Submit
                        </button>
                    </div>

                    <div className="flex items-center justify-self-end gap-2 md:gap-3">
                        <div className="hidden md:flex">
                            <Timer compact />
                        </div>
                        <div className="dropdown dropdown-end">
                            <button
                                tabIndex={0}
                                type="button"
                                className="btn btn-ghost btn-circle avatar placeholder h-10 w-10 min-h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
                                title="Open profile menu"
                            >
                                {user?.profilePic ? (
                                    <div className="h-10 w-10 rounded-full overflow-hidden">
                                        <img src={user.profilePic} alt="Profile" className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-neutral-700 text-neutral-100 flex items-center justify-center text-sm font-semibold">
                                        {userInitial}
                                    </div>
                                )}
                            </button>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content z-[80] mt-3 w-52 rounded-2xl border border-white/10 bg-neutral-900/95 p-2 shadow-2xl">
                                <li className="menu-title text-neutral-400 px-3 py-2">
                                    <span>Hello, {userName}</span>
                                </li>
                                <li>
                                    <button onClick={() => navigate("/profile")} className="text-neutral-200 hover:bg-white/5">
                                        View Profile
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => navigate("/problemset")} className="text-neutral-200 hover:bg-white/5">
                                        Problem Set
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden">
                    <CodeEditor
                        problem={problem}
                        code={code}
                        language={language}
                        onCodeChange={setCode}
                        onLanguageChange={handleLanguageChange}
                        output={output}
                    />
                </div>
            </div>

            {/* Submission Popup */}
            {submissionPopup && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-white/10 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isErroredSubmission ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                                    <span className="text-xs font-bold tracking-[0.22em]">
                                        {isErroredSubmission ? "ERR" : "OK"}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                                        Submission Result
                                    </div>
                                    <div className="text-xl font-semibold text-white">
                                        {isErroredSubmission
                                            ? "Submission Failed"
                                            : String(submissionPopup.problemStatus || submissionPopup.status || "Submitted").replace(/_/g, " ")}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="btn btn-sm btn-ghost text-neutral-400"
                                onClick={() => setSubmissionPopup(null)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-3">
                                <div className="text-xs text-neutral-500 uppercase">Language</div>
                                <div className="font-mono text-white">{submissionPopup.language}</div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-3">
                                <div className="text-xs text-neutral-500 uppercase">Time</div>
                                <div className="text-white">
                                    {new Date(submissionPopup.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>

                        {submissionPopup.errorMessage && (
                            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200 text-sm font-mono whitespace-pre-wrap break-all">
                                {String(submissionPopup.errorMessage)}
                            </div>
                        )}

                        {submissionPopup.message && !isErroredSubmission && (
                            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200 text-sm">
                                {String(submissionPopup.message)}
                            </div>
                        )}

                        {(submissionPopup.testCasesPassed != null || submissionPopup.runtime != null || submissionPopup.memory != null) && (
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                {submissionPopup.testCasesPassed != null && (
                                    <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-3 col-span-2">
                                        <div className="text-xs text-neutral-500 uppercase">Test Cases</div>
                                        <div className="font-mono text-white">{submissionPopup.testCasesPassed} / {submissionPopup.testCasesTotal}</div>
                                    </div>
                                )}
                                <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-3">
                                    <div className="text-xs text-neutral-500 uppercase">Runtime</div>
                                    <div className="text-white">{submissionPopup.runtime ?? "-"} ms</div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-3">
                                    <div className="text-xs text-neutral-500 uppercase">Memory</div>
                                    <div className="text-white">{submissionPopup.memory ?? "-"} KB</div>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 text-xs text-neutral-500">
                            Saved to your submissions history.
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
