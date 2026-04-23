import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  EyeIcon,
  EyeOff,
  FileText,
  FolderIcon,
  GraduationCap,
  Share2Icon,
  Sparkles,
  User,
  Award,
  SaveIcon,
  LoaderCircleIcon,
} from "lucide-react";
import PersonalInfoForm from "../../components/resume-builder/PersonalInfoForm";
import ResumePreview from "../../components/resume-builder/ResumePreview";
import TemplateSelector from "../../components/resume-builder/TemplateSelector";
import ColorPicker from "../../components/resume-builder/ColorPicker";
import ProfessionalSummaryForm from "../../components/resume-builder/ProfessionalSummaryForm";
import ExperienceForm from "../../components/resume-builder/ExperienceForm";
import EducationForm from "../../components/resume-builder/EducationForm";
import ProjectForm from "../../components/resume-builder/ProjectForm";
import SkillsForm from "../../components/resume-builder/SkillsForm";
import api from "./api";
import toast from "react-hot-toast";
import CertificationForm from "../../components/resume-builder/CertificationForm";

const ResumeBuilder = () => {
  const { resumeId } = useParams();

  const [resumeData, setResumeData] = useState({
    _id: "",
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    template: "classic",
    accent_color: "#3b82f6",
    public: false,
  });

  const [activeSectionIndex, setactiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const tabScrollRef = useRef(null);
  const tabRefs = useRef([]);

  // Auto-scroll active tab into view
  const scrollToActiveTab = (index) => {
    setactiveSectionIndex(index);
    if (tabRefs.current[index]) {
      tabRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const scrollTabs = (direction) => {
    if (tabScrollRef.current) {
      tabScrollRef.current.scrollBy({
        left: direction === "left" ? -160 : 160,
        behavior: "smooth",
      });
    }
  };

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
    { id: "certification", name: "Certification", icon: Award },
  ];

  const activeSection = sections[activeSectionIndex];

  const changeResumeVisibility = async () => {
    try {
      const { data } = await api.put("/api/resumes/update", {
        resumeId,
        resumeData: { public: !resumeData.public },
      });

      setResumeData({ ...resumeData, public: !resumeData.public });
      toast.success(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = () => {
    const frontendUrl = window.location.href.split("/builder/")[0];
    const resumeUrl = frontendUrl + "/view/" + resumeId;

    if (navigator.share) {
      navigator.share({ url: resumeUrl, text: "My Resume" });
    }
  };

  const downloadResume = () => {
    window.print();
  };

  const saveResume = async () => {
    try {
      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("removeBackground", removeBackground);

      // Extract image file if it exists, otherwise keep it in resumeData
      const resumeDataCopy = { ...resumeData };
      if (resumeData.personal_info?.image instanceof File) {
        formData.append("image", resumeData.personal_info.image);
        resumeDataCopy.personal_info.image = ""; // Backend will update this
      }

      formData.append("resumeData", JSON.stringify(resumeDataCopy));

      const { data } = await api.put("/api/resumes/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResumeData(data.resume);
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving resume");
    }
  };

  useEffect(() => {
    const loadExistingResume = async () => {
      try {
        const { data } = await api.get("/api/resumes/get/" + resumeId);
        if (data.resume) {
          setResumeData(data.resume);
          document.title = data.resume.title;
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadExistingResume();
  }, [resumeId]);

  return (
    <div>
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link to="/resume-builder" className="flex gap-2 items-center text-neutral-400 hover:text-white transition-colors group">
          <ArrowLeftIcon className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>

        {resumeData.title && (
          <h1 className="hidden sm:block text-sm font-semibold text-white bg-white/10 px-4 py-1.5 rounded-full border border-white/5 shadow-sm">
            {resumeData.title}
          </h1>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8 grid lg:grid-cols-12 gap-8">
        {/* LEFT - Form Panel */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-950/80 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden backdrop-blur-xl">
            {/* Progress Bar */}
            <div className="h-1 bg-neutral-900">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 ease-out rounded-r-full"
                style={{
                  width: `${
                    ((activeSectionIndex + 1) * 100) / sections.length
                  }%`,
                }}
              />
            </div>

            {/* Section Tabs with Scroll Arrows */}
            <div className="relative px-2 pt-4 pb-2">
              {/* Left Arrow */}
              <button
                onClick={() => scrollTabs("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-neutral-900/90 border border-white/10 hover:border-orange-500/30 hover:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-orange-400 transition-all shadow-md"
              >
                <ChevronLeft className="size-4" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => scrollTabs("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-neutral-900/90 border border-white/10 hover:border-orange-500/30 hover:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-orange-400 transition-all shadow-md"
              >
                <ChevronRight className="size-4" />
              </button>

              {/* Scrollable Tabs */}
              <div
                ref={tabScrollRef}
                className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth mx-9"
              >
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  const isActive = index === activeSectionIndex;
                  const isCompleted = index < activeSectionIndex;
                  return (
                    <button
                      key={section.id}
                      ref={(el) => (tabRefs.current[index] = el)}
                      onClick={() => scrollToActiveTab(index)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500/15 to-red-500/10 text-orange-400 shadow-sm border border-orange-500/25"
                          : isCompleted
                          ? "text-orange-300/70 hover:bg-orange-500/5 hover:text-orange-300"
                          : "text-neutral-500 hover:bg-white/5 hover:text-neutral-300 border border-transparent"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span>{section.name}</span>
                      {isCompleted && (
                        <svg className="size-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template & Color */}
            <div className="flex justify-between px-6 py-3 border-t border-white/5 bg-black/20">
              <TemplateSelector
                selectedTemplate={resumeData.template}
                onChange={(template) =>
                  setResumeData((p) => ({ ...p, template }))
                }
              />

              <ColorPicker
                selectedColor={resumeData.accent_color}
                onChange={(color) =>
                  setResumeData((p) => ({ ...p, accent_color: color }))
                }
              />
            </div>

            {/* Forms */}
            <div className="px-6 pb-6">
              {activeSection.id === "personal" && (
                <PersonalInfoForm
                  data={resumeData.personal_info}
                  onChange={(d) =>
                    setResumeData((p) => ({ ...p, personal_info: d }))
                  }
                  removeBackground={removeBackground}
                  setRemoveBackground={setRemoveBackground}
                />
              )}

              {activeSection.id === "summary" && (
                <ProfessionalSummaryForm
                  data={resumeData.professional_summary}
                  onChange={(d) =>
                    setResumeData((p) => ({
                      ...p,
                      professional_summary: d,
                    }))
                  }
                  setResumeDate={setResumeData}
                />
              )}

              {activeSection.id === "experience" && (
                <ExperienceForm
                  data={resumeData.experience}
                  onChange={(d) =>
                    setResumeData((p) => ({ ...p, experience: d }))
                  }
                />
              )}

              {activeSection.id === "education" && (
                <EducationForm
                  data={resumeData.education}
                  onChange={(d) =>
                    setResumeData((p) => ({ ...p, education: d }))
                  }
                />
              )}

              {activeSection.id === "projects" && (
                <ProjectForm
                  data={resumeData.project}
                  onChange={(d) =>
                    setResumeData((p) => ({ ...p, project: d }))
                  }
                />
              )}

              {activeSection.id === "skills" && (
                <SkillsForm
                  data={resumeData.skills}
                  onChange={(d) =>
                    setResumeData((p) => ({ ...p, skills: d }))
                  }
                />
              )}

              {activeSection.id === "certification" && (
                <CertificationForm
                  data={resumeData.certification}
                  onChange={(d) =>
                    setResumeData((p) => ({ ...p, certification: d }))
                  }
                />
              )}

              {/* Navigation & Save */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => scrollToActiveTab(Math.max(0, activeSectionIndex - 1))}
                  disabled={activeSectionIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </button>

                <button
                  onClick={() => toast.promise(saveResume, { loading: "Saving..." })}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-sm shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <SaveIcon className="size-4" />
                  Save
                </button>

                <button
                  onClick={() => scrollToActiveTab(Math.min(sections.length - 1, activeSectionIndex + 1))}
                  disabled={activeSectionIndex === sections.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Preview Panel */}
        <div className="lg:col-span-7">
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 border border-white/10 hover:border-orange-500/40 hover:bg-neutral-800 text-neutral-300 hover:text-orange-300 rounded-xl text-sm font-medium transition-all duration-200"
            >
              <Share2Icon className="size-3.5" />
              Share
            </button>

            <button
              onClick={changeResumeVisibility}
              className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-sm font-medium transition-all duration-200 ${
                resumeData.public
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-neutral-900 border-white/10 text-neutral-400 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400"
              }`}
            >
              {resumeData.public ? (
                <><EyeIcon className="size-3.5" /> Public</>
              ) : (
                <><EyeOff className="size-3.5" /> Private</>
              )}
            </button>

            <button
              onClick={downloadResume}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <DownloadIcon className="size-3.5" />
              Download
            </button>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.5)] bg-neutral-900">
            <ResumePreview
              data={resumeData}
              template={resumeData.template}
              accentColor={resumeData.accent_color}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
