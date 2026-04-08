import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import axiosClient from "../utils/axiosClient";

const TARGET_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cybersecurity Analyst",
  "Product Manager",
];

const SCORE_ITEMS = [
  { key: "resumeScore", label: "Resume Score", tone: "text-orange-300", chartColor: "#fb923c" },
  { key: "atsScore", label: "ATS Score", tone: "text-emerald-300", chartColor: "#34d399" },
  { key: "keywordMatchScore", label: "Keyword Match", tone: "text-amber-300", chartColor: "#fbbf24" },
  { key: "formatScore", label: "Format", tone: "text-sky-300", chartColor: "#38bdf8" },
  { key: "sectionScore", label: "Sections", tone: "text-rose-300", chartColor: "#fb7185" },
];

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  return fallback;
};

const clampScore = (value) => Math.max(0, Math.min(100, Number(value) || 0));

function ScoreCard({ label, value, tone, chartColor }) {
  const score = clampScore(value);

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-4 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full p-2 shadow-[0_0_35px_rgba(249,115,22,0.08)]"
        style={{ background: `conic-gradient(${chartColor} ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-black">
          <span className={`text-2xl font-semibold ${tone}`}>{score}</span>
        </div>
      </div>
      <div className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-500">{label}</div>
    </div>
  );
}

function TextList({ title, items, emptyText }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-5">
      <h3 className="text-center text-lg font-semibold">{title}</h3>
      {items?.length ? (
        <ul className="mt-4 space-y-3 text-left text-sm text-neutral-300">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-neutral-500">{emptyText}</p>
      )}
    </div>
  );
}

function ScoreCharts({ analysis }) {
  const metrics = SCORE_ITEMS.map((item) => ({
    ...item,
    value: clampScore(analysis?.[item.key]),
  }));

  const chartSize = 240;
  const center = chartSize / 2;
  const radius = 82;
  const pointFor = (value, index, distance = radius) => {
    const angle = (-90 + (index * 360) / metrics.length) * (Math.PI / 180);
    const scaledDistance = distance * (value / 100);
    return [
      center + scaledDistance * Math.cos(angle),
      center + scaledDistance * Math.sin(angle),
    ];
  };
  const radarPoints = metrics.map((metric, index) => pointFor(metric.value, index).join(",")).join(" ");

  const insightBars = [
    { label: "Strengths", value: analysis?.strengths?.length || 0, color: "bg-emerald-400" },
    { label: "Fixes", value: analysis?.weaknesses?.length || 0, color: "bg-rose-400" },
    { label: "Missing Skills", value: analysis?.missingSkills?.length || 0, color: "bg-amber-400" },
    { label: "ATS Keywords", value: analysis?.atsKeywords?.length || 0, color: "bg-sky-400" },
    { label: "Recommendations", value: analysis?.recommendations?.length || 0, color: "bg-orange-400" },
  ];
  const maxInsightCount = Math.max(...insightBars.map((item) => item.value), 1);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-5">
        <h3 className="text-center text-lg font-semibold">Score Breakdown</h3>
        <div className="mt-6 space-y-4">
          {metrics.map((metric) => (
            <div key={metric.key}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="text-neutral-300">{metric.label}</span>
                <span className={`font-semibold ${metric.tone}`}>{metric.value}/100</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-black/80 ring-1 ring-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${metric.value}%`,
                    background: `linear-gradient(90deg, ${metric.chartColor}, #ef4444)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-5 text-center">
        <h3 className="text-lg font-semibold">Resume Radar</h3>
        <svg viewBox={`0 0 ${chartSize} ${chartSize}`} className="mx-auto mt-4 h-72 max-h-[280px] w-full max-w-[320px]">
          {[20, 40, 60, 80, 100].map((level) => (
            <polygon
              key={level}
              points={metrics.map((metric, index) => pointFor(level, index, radius).join(",")).join(" ")}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          ))}
          {metrics.map((metric, index) => {
            const [x, y] = pointFor(100, index, radius);
            const labelX = center + (x - center) * 1.22;
            const labelY = center + (y - center) * 1.22;
            return (
              <g key={metric.key}>
                <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.07)" />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(229,229,229,0.75)"
                  fontSize="8"
                >
                  {metric.label.replace(" Score", "")}
                </text>
              </g>
            );
          })}
          <polygon points={radarPoints} fill="rgba(249,115,22,0.28)" stroke="#fb923c" strokeWidth="2" />
          {metrics.map((metric, index) => {
            const [x, y] = pointFor(metric.value, index);
            return <circle key={`${metric.key}-point`} cx={x} cy={y} r="3" fill={metric.chartColor} />;
          })}
        </svg>
      </div>

      <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-5 xl:col-span-2">
        <h3 className="text-center text-lg font-semibold">Report Signals</h3>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          {insightBars.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-black/70 p-4 text-center">
              <div className="text-2xl font-semibold text-white">{item.value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-neutral-500">{item.label}</div>
              <div className="mt-4 flex h-20 items-end justify-center rounded-lg bg-neutral-950 px-4 py-3">
                <div
                  className={`w-8 rounded-t-md ${item.color}`}
                  style={{ height: `${Math.max(12, (item.value / maxInsightCount) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalysisResult({ analysis }) {
  if (!analysis) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-white/10 bg-neutral-950/60 p-8 text-center text-neutral-400">
        Upload a resume and run the analyzer.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-300">Analysis Report</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {analysis.candidateName || analysis.fileName || "Resume"}
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              {analysis.targetRole || "General role"} {analysis.modelUsed ? `- ${analysis.modelUsed}` : ""}
            </p>
          </div>
          <div className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-200">
            {analysis.createdAt ? new Date(analysis.createdAt).toLocaleString() : "New analysis"}
          </div>
        </div>

        {analysis.summary && (
          <p className="mt-5 text-neutral-300 leading-relaxed">{analysis.summary}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {SCORE_ITEMS.map((item) => (
          <ScoreCard
            key={item.key}
            label={item.label}
            value={analysis[item.key]}
            tone={item.tone}
            chartColor={item.chartColor}
          />
        ))}
      </div>

      <ScoreCharts analysis={analysis} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TextList title="Strengths" items={analysis.strengths} emptyText="No strengths returned yet." />
        <TextList title="Fix Next" items={analysis.weaknesses} emptyText="No weaknesses returned yet." />
        <TextList title="Missing Skills" items={analysis.missingSkills} emptyText="No missing skills returned yet." />
        <TextList title="ATS Keywords" items={analysis.atsKeywords} emptyText="No ATS keywords returned yet." />
      </div>

      <TextList title="Recommendations" items={analysis.recommendations} emptyText="No recommendations returned yet." />

      {analysis.improvedSummary && (
        <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-5">
          <h3 className="text-lg font-semibold">Improved Summary</h3>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{analysis.improvedSummary}</p>
        </div>
      )}

      {analysis.roleAlignment && (
        <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-5">
          <h3 className="text-lg font-semibold">Role Alignment</h3>
          <p className="mt-4 text-sm leading-relaxed text-neutral-300">{analysis.roleAlignment}</p>
        </div>
      )}

      {analysis.jobMatch && (
        <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold">Job Match</h3>
            <span className="text-sm font-semibold text-emerald-300">{Number(analysis.jobMatch.score) || 0}/100</span>
          </div>
          {analysis.jobMatch.summary && (
            <p className="mt-4 text-sm leading-relaxed text-neutral-300">{analysis.jobMatch.summary}</p>
          )}
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextList title="Requirements Met" items={analysis.jobMatch.requirementsMet} emptyText="No matched requirements returned." />
            <TextList title="Requirements Missing" items={analysis.jobMatch.requirementsMissing} emptyText="No missing requirements returned." />
          </div>
        </div>
      )}

      {analysis.courseRecommendations?.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-5">
          <h3 className="text-lg font-semibold">Courses And Certifications</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {analysis.courseRecommendations.map((course, index) => (
              <div key={`${course.title}-${index}`} className="rounded-xl border border-white/10 bg-black/70 p-4">
                <div className="font-semibold text-white">{course.title}</div>
                {course.reason && <p className="mt-2 text-sm text-neutral-400">{course.reason}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.sectionFeedback?.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-5">
          <h3 className="text-lg font-semibold">Section Feedback</h3>
          <div className="mt-4 space-y-3">
            {analysis.sectionFeedback.map((item, index) => (
              <div key={`${item.section}-${index}`} className="rounded-xl border border-white/10 bg-black/70 p-4">
                <div className="font-semibold text-orange-200">{item.section}</div>
                <p className="mt-2 text-sm text-neutral-300">{item.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.fullAnalysis && (
        <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-5">
          <h3 className="text-lg font-semibold">Detailed Report</h3>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{analysis.fullAnalysis}</p>
        </div>
      )}
    </div>
  );
}

export default function AIAnalyzer() {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    candidateName: "",
    targetRole: "Software Engineer",
    jobDescription: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  const reportText = useMemo(() => {
    if (!analysis) return "";

    const lines = [
      `AI Analyzer Report`,
      `Candidate: ${analysis.candidateName || "Candidate"}`,
      `Target Role: ${analysis.targetRole || "General role"}`,
      `Resume Score: ${analysis.resumeScore}/100`,
      `ATS Score: ${analysis.atsScore}/100`,
      "",
      "Summary",
      analysis.summary || "",
      "",
      "Recommendations",
      ...(analysis.recommendations || []).map((item) => `- ${item}`),
      "",
      "Detailed Report",
      analysis.fullAnalysis || "",
    ];

    return lines.join("\n");
  }, [analysis]);

  useEffect(() => {
    if (!user) return;

    setFormData((previous) => ({
      ...previous,
      candidateName: previous.candidateName || `${user.firstname || ""} ${user.lastname || ""}`.trim(),
    }));
  }, [user]);

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const response = await axiosClient.get("/resume-analyzer/history");
      setHistory(Array.isArray(response.data?.history) ? response.data.history : []);
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load resume analysis history."));
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");

    if (!resumeFile) {
      setError("Please upload a PDF, DOCX, or TXT resume.");
      return;
    }

    const payload = new FormData();
    payload.append("resume", resumeFile);
    payload.append("candidateName", formData.candidateName);
    payload.append("targetRole", formData.targetRole);
    payload.append("jobDescription", formData.jobDescription);

    setIsAnalyzing(true);
    try {
      const response = await axiosClient.post("/resume-analyzer/analyze", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysis(response.data?.analysis || null);
      await fetchHistory();
    } catch (error) {
      setError(getErrorMessage(error, "Unable to analyze this resume right now."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenHistory = async (id) => {
    setError("");
    try {
      const response = await axiosClient.get(`/resume-analyzer/history/${id}`);
      setAnalysis(response.data?.analysis || null);
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load this analysis."));
    }
  };

  const handleDeleteHistory = async (id) => {
    setError("");
    try {
      await axiosClient.delete(`/resume-analyzer/history/${id}`);
      setHistory((previous) => previous.filter((item) => item._id !== id));
      if (analysis?._id === id) {
        setAnalysis(null);
      }
    } catch (error) {
      setError(getErrorMessage(error, "Unable to delete this analysis."));
    }
  };

  const handleDownloadReport = () => {
    if (!reportText) return;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume-analysis-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/20">
      <Navbar />

      <main className="container mx-auto px-5 pt-24 pb-12">
        <div className="mx-auto mb-8 flex max-w-4xl flex-col items-center gap-5 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-300">ZenCode AI</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">AI Analyzer</h1>
            <p className="mx-auto mt-3 max-w-3xl text-neutral-400">
              Upload your resume, choose a target role, and get ATS scoring, keyword gaps, job match analysis, and a stronger summary.
            </p>
          </div>
          {analysis && (
            <button
              type="button"
              onClick={handleDownloadReport}
              className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 font-semibold text-orange-100 transition-colors hover:bg-orange-500/20"
            >
              Download Report
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mx-auto max-w-6xl space-y-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <form onSubmit={handleAnalyze} className="rounded-2xl border border-white/10 bg-neutral-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <h2 className="text-center text-xl font-semibold">Analyze Resume</h2>
              <p className="mx-auto mt-2 max-w-xl text-center text-sm text-neutral-500">
                Upload a resume and optionally paste a job description for a sharper match report.
              </p>

              <label className="mt-5 block text-left">
                <span className="text-sm font-medium text-neutral-300">Resume File</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-orange-600"
                />
              </label>

              <label className="mt-5 block text-left">
                <span className="text-sm font-medium text-neutral-300">Candidate Name</span>
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-orange-500/60"
                />
              </label>

              <label className="mt-5 block text-left">
                <span className="text-sm font-medium text-neutral-300">Target Role</span>
                <select
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-orange-500/60"
                >
                  {TARGET_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </label>

              <label className="mt-5 block text-left">
                <span className="text-sm font-medium text-neutral-300">Job Description</span>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  rows={7}
                  placeholder="Paste a job description for sharper match analysis."
                  className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-orange-500/60"
                />
              </label>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
              </button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-6">
              <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
                <h2 className="text-xl font-semibold">Recent Analyses</h2>
                {isHistoryLoading && <span className="text-xs text-neutral-500">Loading...</span>}
              </div>

              <div className="mt-5 space-y-3">
                {history.length ? (
                  history.map((item) => (
                    <div key={item._id} className="rounded-xl border border-white/10 bg-black/70 p-4">
                      <button
                        type="button"
                        onClick={() => handleOpenHistory(item._id)}
                        className="block w-full text-center sm:text-left"
                      >
                        <div className="font-semibold text-white">{item.candidateName || item.fileName || "Resume"}</div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {item.targetRole || "General role"} - Score {item.resumeScore || 0}/100
                        </div>
                        <div className="mt-1 text-xs text-neutral-600">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                        </div>
                      </button>
                      <div className="text-center sm:text-left">
                        <button
                          type="button"
                          onClick={() => handleDeleteHistory(item._id)}
                          className="mt-3 text-xs font-semibold text-rose-300 hover:text-rose-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">No resume reports yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full">
            <AnalysisResult analysis={analysis} />
          </div>
        </div>
      </main>
    </div>
  );
}
