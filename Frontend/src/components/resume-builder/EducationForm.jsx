import { GraduationCap, Plus, Trash2 } from "lucide-react";

const EducationForm = ({ data, onChange }) => {
  const educations = data || [];

  const addEducation = () => {
    const newEducation = {
      institution: "",
      degree: "",
      field: "",
      graduation_date: "",
      gpa: "",
    };
    onChange([...educations, newEducation]);
  };

  const removeEducation = (index) => {
    const updated = educations.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Education
          </h3>
          <p className="text-sm text-neutral-400">Add your education details</p>
        </div>

        <button
          onClick={addEducation}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
        >
          <Plus className="size-4" />
          Add Education
        </button>
      </div>

      {educations.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <p>No education added yet.</p>
          <p className="text-sm">Click "Add Education" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {educations.map((education, index) => (
            <div
              key={index}
              className="p-4 border border-white/10 bg-black/20 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-start">
                <h4 className="text-white font-medium">Education #{index + 1}</h4>
                <button
                  className="text-red-500 hover:text-red-400 transition-colors"
                  onClick={() => removeEducation(index)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  value={education.institution || ""}
                  onChange={(e) =>
                    updateEducation(index, "institution", e.target.value)
                  }
                  type="text"
                  placeholder="Institution Name"
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />

                <input
                  value={education.degree || ""}
                  onChange={(e) =>
                    updateEducation(index, "degree", e.target.value)
                  }
                  type="text"
                  placeholder="Degree (e.g., Bachelor's, Master's)"
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />

                <input
                  value={education.field || ""}
                  onChange={(e) =>
                    updateEducation(index, "field", e.target.value)
                  }
                  type="text"
                  placeholder="Field of Study"
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />

                <input
                  value={education.graduation_date || ""}
                  onChange={(e) =>
                    updateEducation(index, "graduation_date", e.target.value)
                  }
                  type="month"
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:bg-white/5 disabled:opacity-50"
                />
              </div>

              <input
                value={education.gpa || ""}
                onChange={(e) =>
                  updateEducation(index, "gpa", e.target.value)
                }
                type="text"
                placeholder="GPA (optional)"
                className="w-full px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationForm;