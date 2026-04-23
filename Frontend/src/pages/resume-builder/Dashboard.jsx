import {
  ChevronLeft,
  ChevronRight,
  FilePenLineIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadCloud,
  UploadCloudIcon,
  XIcon,
  Sparkles,
  Clock,
  FileText,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api.js";
import toast from "react-hot-toast";
import pdfToText from "react-pdftotext";
import dummyResumeData from "../../components/resume-builder/dummyResumeData";

import ModernTemplate from "../../assets/templates/ModernTemplate";
import MinimalImageTemplate from "../../assets/templates/MinimalImageTemplate";
import MinimalTemplate from "../../assets/templates/MinimalTemplate";
import ClassicTemplate from "../../assets/templates/ClassicTemplate";
import MinimalistTemplate from "../../assets/templates/MinimalistTemplate";
import CreativeVisualTemplate from "../../assets/templates/CreativeVisualTemplate";
import CorporateATSTemplate from "../../assets/templates/CorporateATSTemplate";
import ModernProTemplate from "../../assets/templates/ModernProTemplate";

const templateComponents = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  "minimal-image": MinimalImageTemplate,
  minimal: MinimalTemplate,
  minimalist: MinimalistTemplate,
  creativeVisual: CreativeVisualTemplate,
  corporateATSTemplate: CorporateATSTemplate,
  modernProTemplate: ModernProTemplate,
};

const Dashboard = () => {
  const [allResumes, setAllResumes] = useState([]);
  const [showCreteResume, setShowCreteResume] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get("/api/resumes/list");
      setAllResumes(data.resumes);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const templateScrollRef = useRef(null);

  const scrollTemplates = (direction) => {
    if (templateScrollRef.current) {
      templateScrollRef.current.scrollBy({
        left: direction === "left" ? -260 : 260,
        behavior: "smooth",
      });
    }
  };

  const templates = [
    { id: "classic", name: "Classic" },
    { id: "modern", name: "Modern" },
    { id: "minimal-image", name: "Minimal Image" },
    { id: "minimal", name: "Minimal" },
    { id: "creativeVisual", name: "Creative Visual" },
    { id: "minimalist", name: "Minimalist" },
    { id: "modernProTemplate", name: "Modern Pro" },
    { id: "corporateATSTemplate", name: "Corporate ATS" },
  ];

  const uploadResume = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const resumeText = await pdfToText(resume);
      if (!resumeText || resumeText.trim().length === 0) {
        throw new Error("Could not extract text from the PDF. Please try a different file.");
      }
      const { data } = await api.post("/api/ai/upload-resume", {
        title,
        resumeText,
      });
      setTitle("");
      setResume(null);
      setShowUploadResume(false);
      navigate(`/resume-builder/builder/${data.resumeId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
    setIsLoading(false);
  };

  const createResume = async (e) => {
    try {
      e.preventDefault();
      const { data } = await api.post("/api/resumes/create", { title });
      
      await api.put("/api/resumes/update", {
         resumeId: data.resume._id,
         resumeData: { design: { template: selectedTemplate } }
      });
      
      setAllResumes([...allResumes, data.resume]);
      setTitle("");
      setShowCreteResume(false);
      setCreateStep(1);
      navigate(`/resume-builder/builder/${data.resume._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const editTitle = async (e) => {
    try {
      e.preventDefault();
      const confirmEdit = window.confirm("Update resume title?");
      if (confirmEdit) {
        const { data } = await api.put("/api/resumes/update", {
          resumeId: editResumeId,
          resumeData: { title },
        });
        setAllResumes(
          allResumes.map((resume) =>
            resume._id === editResumeId ? { ...resume, title } : resume
          )
        );
        setTitle("");
        setEditResumeId("");
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const deleteResume = async (resumeId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this resume");
      if (confirmDelete) {
        const { data } = await api.delete(`/api/resumes/delete/${resumeId}`);
        setAllResumes(allResumes.filter((r) => r._id !== resumeId));
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    loadAllResumes();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/20">
      <main className="container mx-auto px-5 pt-4 pb-12">
        {/* Header — matches AI Analyzer */}
        <div className="mx-auto mb-10 flex max-w-4xl flex-col items-center gap-5 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-300">ZenCode AI</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">AI Resume Builder</h1>
            <p className="mx-auto mt-3 max-w-3xl text-neutral-400">
              Create professional, ATS-optimized resumes with AI assistance. Choose a template, fill in your details, and download in seconds.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl space-y-8">
          {/* Action Cards */}
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <h2 className="text-center text-xl font-semibold">Get Started</h2>
              <p className="mx-auto mt-2 max-w-xl text-center text-sm text-neutral-500">
                Create a new resume from scratch or upload an existing one to parse and edit.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => { setShowCreteResume(true); setCreateStep(1); }}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-gradient-to-r from-orange-500/[0.08] via-black/80 to-black/80 p-5 text-left transition-all hover:border-orange-500/30 hover:from-orange-500/[0.15]"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.08)] group-hover:scale-110 transition-transform duration-300">
                    <PlusIcon className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Create New</div>
                    <div className="mt-1 text-sm text-neutral-400">Start from a template</div>
                  </div>
                </button>

                <button
                  onClick={() => setShowUploadResume(true)}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-gradient-to-r from-sky-500/[0.08] via-black/80 to-black/80 p-5 text-left transition-all hover:border-sky-500/30 hover:from-sky-500/[0.15]"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 shadow-[0_0_30px_rgba(56,189,248,0.08)] group-hover:scale-110 transition-transform duration-300">
                    <UploadCloudIcon className="h-6 w-6 text-sky-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Upload Existing</div>
                    <div className="mt-1 text-sm text-neutral-400">Parse your PDF resume</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Resume List */}
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-6">
              <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
                <h2 className="text-xl font-semibold">Your Resumes</h2>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-400">
                    {allResumes.length} saved
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {allResumes.length > 0 ? (
                  allResumes.map((res) => (
                    <div
                      key={res._id}
                      className="rounded-2xl border border-white/10 bg-gradient-to-r from-orange-500/[0.08] via-black/80 to-black/80 p-4 sm:p-5 cursor-pointer transition-all hover:border-orange-500/30"
                      onClick={() => navigate(`/resume-builder/builder/${res._id}`)}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.08)]">
                            <FileText className="h-6 w-6 text-orange-300" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {res.template && (
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-300">
                                  {res.template}
                                </span>
                              )}
                              {(res.updatedAt || res.createdAt) && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-neutral-400">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(res.updatedAt || res.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                            {/* Title */}
                            {editResumeId === res._id ? (
                              <form onSubmit={editTitle} onClick={(e) => e.stopPropagation()} className="mt-3">
                                <input
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                  className="w-full text-sm py-1.5 px-3 rounded-xl border border-white/10 bg-black/70 text-white outline-none focus:border-orange-500/60 transition-colors"
                                  autoFocus
                                  required
                                />
                              </form>
                            ) : (
                              <div className="mt-3 font-semibold text-white">{res.title || "Untitled Resume"}</div>
                            )}
                            <div className="mt-1 text-sm text-neutral-400">
                              Resume ready to edit, download, or share.
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0 sm:flex-row" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/resume-builder/builder/${res._id}`)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 py-2.5 text-sm font-semibold text-orange-100 transition-all hover:border-orange-300/40 hover:bg-orange-500/15 hover:text-white"
                          >
                            <Sparkles className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setEditResumeId(res._id);
                              setTitle(res.title);
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-neutral-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Rename
                          </button>
                          <button
                            onClick={() => deleteResume(res._id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-rose-200 transition-all hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-100"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/40 p-6 text-center">
                    <p className="text-sm text-neutral-500">No resumes yet.</p>
                    <p className="mt-2 text-xs text-neutral-600">Create or upload your first resume to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create Modal Wizard */}
        {showCreteResume && (
          <div
            onClick={() => setShowCreteResume(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-5xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] animate-fade-in-up max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white">Create New Resume</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Step {createStep} of 2</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreteResume(false)}
                  className="size-8 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <XIcon className="size-4 text-neutral-400" />
                </button>
              </div>

              {createStep === 1 ? (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="mb-4 shrink-0">
                    <p className="text-sm text-neutral-400">Select a starting template. You can always change this later.</p>
                  </div>

                  {/* Scrollable template previews with arrows */}
                  <div className="relative flex-1 overflow-hidden">
                    <button
                      onClick={() => scrollTemplates("left")}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/80 border border-white/10 hover:border-orange-500/40 hover:bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition-all shadow-lg backdrop-blur"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      onClick={() => scrollTemplates("right")}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/80 border border-white/10 hover:border-orange-500/40 hover:bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition-all shadow-lg backdrop-blur"
                    >
                      <ChevronRight className="size-5" />
                    </button>

                    <div
                      ref={templateScrollRef}
                      className="flex gap-5 overflow-x-auto py-4 px-12 no-scrollbar scroll-smooth"
                    >
                      {templates.map((template) => {
                        const TemplateComponent = templateComponents[template.id];
                        const isSelected = selectedTemplate === template.id;
                        return (
                          <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`group relative shrink-0 cursor-pointer transition-all duration-300 rounded-xl ${
                              isSelected
                                ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-neutral-950 scale-[1.02]"
                                : "hover:ring-1 hover:ring-white/20 hover:ring-offset-1 hover:ring-offset-neutral-950"
                            }`}
                          >
                            <div className="w-[200px] h-[280px] rounded-xl overflow-hidden border border-white/10 bg-white relative">
                              <div
                                className="origin-top-left absolute top-0 left-0"
                                style={{
                                  transform: "scale(0.245)",
                                  width: "815px",
                                  height: "1150px",
                                }}
                              >
                                <TemplateComponent
                                  data={dummyResumeData}
                                  accentColor="#3b82f6"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                            </div>
                            <div className="mt-2 flex items-center justify-between px-1">
                              <span className={`text-sm font-medium ${isSelected ? "text-orange-400" : "text-neutral-300"}`}>
                                {template.name}
                              </span>
                              {isSelected && (
                                <div className="size-5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 shrink-0">
                     <button
                        onClick={() => setCreateStep(2)}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                     >
                       Continue
                     </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={createResume} className="flex-1 flex flex-col justify-center">
                  <div className="mb-6">
                     <p className="text-sm text-neutral-400 cursor-pointer hover:text-white transition-colors" onClick={() => setCreateStep(1)}>
                       ← Back to templates
                     </p>
                  </div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Resume Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Software Engineer Resume"
                    className="w-full py-3 mb-6 px-4 rounded-xl border border-white/10 bg-black/70 text-white outline-none focus:border-orange-500/60 transition-colors"
                    required
                    autoFocus
                  />
                  <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300">
                    Create & Edit
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadResume && (
          <form
            onSubmit={uploadResume}
            onClick={() => setShowUploadResume(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] animate-fade-in-up"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Resume</h2>
                <button
                  type="button"
                  onClick={() => setShowUploadResume(false)}
                  className="size-8 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <XIcon className="size-4 text-neutral-400" />
                </button>
              </div>

              <label className="text-sm font-medium text-neutral-300 mb-2 block">Resume Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Updated Resume"
                className="w-full py-3 mb-4 px-4 rounded-xl border border-white/10 bg-black/70 text-white outline-none focus:border-orange-500/60 transition-colors"
                required
              />

              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-white/10 hover:border-orange-500/40 bg-black/40 hover:bg-neutral-900 rounded-2xl p-8 text-center cursor-pointer transition-colors group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setResume(e.target.files[0])}
                  className="hidden"
                  accept=".pdf"
                />
                {resume ? (
                  <div className="flex items-center justify-center gap-2">
                    <FilePenLineIcon className="size-5 text-orange-400" />
                    <p className="text-orange-200 font-medium truncate max-w-full">{resume.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="size-12 rounded-2xl bg-black/50 border border-white/5 group-hover:bg-orange-500/10 flex items-center justify-center transition-colors">
                      <UploadCloud className="size-6 text-neutral-500 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-400 group-hover:text-neutral-300">Click to upload PDF</p>
                      <p className="text-xs text-neutral-500 mt-1">PDF files only, max 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  "Upload & Parse"
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default Dashboard;