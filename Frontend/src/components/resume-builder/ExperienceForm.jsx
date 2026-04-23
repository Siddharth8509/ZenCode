import { Briefcase, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "../../pages/resume-builder/api";
import toast from "react-hot-toast";

const ExperienceForm = ({ data, onChange }) => {
  const experiences = data || [];
  const [generatingIndex, setGeneratingIndex] = useState(-1);

  const addExperience = () => {
    const newExperience = {
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current: false,
    };
    onChange([...experiences, newExperience]);
  };

  const removeExperience = (index) => {
    const updated = experiences.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const generateDescription = async (index) => {
    setGeneratingIndex(index);
    const experience = experiences[index];

    const prompt = `enhance this job description ${experience.description} for the position of ${experience.position} at ${experience.company}.`;

    try {
      const res = await api.post("/api/ai/enhance-job-desc", {
        userContent: prompt,
      });

      updateExperience(index, "description", res.data.enhancedContent);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGeneratingIndex(-1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Professional Experience
          </h3>
          <p className="text-sm text-neutral-400">Add your job experience</p>
        </div>

        <button
          onClick={addExperience}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
        >
          <Plus className="size-4" />
          Add Experience
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <p>No work experience added yet.</p>
          <p className="text-sm">Click "Add Experience" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience, index) => (
            <div
              key={index}
              className="p-4 border border-white/10 bg-black/20 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-start">
                <h4 className="text-white font-medium">Experience #{index + 1}</h4>
                <button
                  className="text-red-500 hover:text-red-400 transition-colors"
                  onClick={() => removeExperience(index)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  value={experience.company || ""}
                  onChange={(e) =>
                    updateExperience(index, "company", e.target.value)
                  }
                  placeholder="Company Name"
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:ring-2 focus:ring-orange-500/50 outline-none"
                />

                <input
                  value={experience.position || ""}
                  onChange={(e) =>
                    updateExperience(index, "position", e.target.value)
                  }
                  placeholder="Job Title"
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:ring-2 focus:ring-orange-500/50 outline-none"
                />

                <input
                  type="month"
                  value={experience.start_date || ""}
                  onChange={(e) =>
                    updateExperience(index, "start_date", e.target.value)
                  }
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:ring-2 focus:ring-orange-500/50 outline-none"
                />

                <input
                  type="month"
                  value={experience.end_date || ""}
                  onChange={(e) =>
                    updateExperience(index, "end_date", e.target.value)
                  }
                  disabled={experience.is_current}
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:ring-2 focus:ring-orange-500/50 outline-none disabled:opacity-50 disabled:bg-white/5"
                />
              </div>

              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={experience.is_current || false}
                  onChange={(e) =>
                    updateExperience(index, "is_current", e.target.checked)
                  }
                  className="rounded border-white/10 bg-black/40 text-orange-500 focus:ring-orange-500/50 cursor-pointer"
                />
                <span className="text-sm text-neutral-300">
                  Currently working here
                </span>
              </label>

              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-neutral-300">
                    Job Description
                  </label>

                  <button
                    onClick={() => generateDescription(index)}
                    disabled={
                      generatingIndex === index ||
                      !experience.position ||
                      !experience.company
                    }
                    className="flex items-center gap-1 px-2 py-1 text-sm bg-orange-500/10 text-orange-400 rounded border border-orange-500/20 hover:bg-orange-500/20 disabled:opacity-50 transition-colors"
                  >
                    {generatingIndex === index ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {generatingIndex === index
                      ? "Enhancing..."
                      : "AI Enhance"}
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={experience.description || ""}
                  onChange={(e) =>
                    updateExperience(index, "description", e.target.value)
                  }
                  className="w-full text-sm px-3 py-2 border border-white/10 bg-black/40 text-white rounded-md focus:ring-2 focus:ring-orange-500/50 outline-none resize-none"
                  placeholder="Describe your responsibilities..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceForm;