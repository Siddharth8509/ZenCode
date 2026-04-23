import { Plus, Trash2 } from "lucide-react";

const ProjectForm = ({ data, onChange }) => {
  const projects = data || [];

  const addProject = () => {
    const newProject = {
      name: "",
      type: "",
      description: "",
      link: "",
    };
    onChange([...projects, newProject]);
  };

  const removeProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Projects
          </h3>
          <p className="text-sm text-neutral-400">
            Add your projects details
          </p>
        </div>

        <button
          onClick={addProject}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
        >
          <Plus className="size-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-4 mt-6">
        {projects.map((project, index) => (
          <div
            key={index}
            className="p-4 border border-white/10 bg-black/20 rounded-lg space-y-3"
          >
            <div className="flex justify-between items-start">
              <h4 className="text-white font-medium">Project #{index + 1}</h4>
              <button
                className="text-red-500 hover:text-red-400 transition-colors"
                onClick={() => removeProject(index)}
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                value={project.name || ""}
                onChange={(e) =>
                  updateProject(index, "name", e.target.value)
                }
                placeholder="Project Name"
                className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />

              <input
                value={project.type || ""}
                onChange={(e) =>
                  updateProject(index, "type", e.target.value)
                }
                placeholder="Project Type"
                className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <input
              value={project.link || ""}
              onChange={(e) =>
                updateProject(index, "link", e.target.value)
              }
              placeholder="Project Link"
              className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white w-full rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />

            <textarea
              value={project.description || ""}
              onChange={(e) =>
                updateProject(index, "description", e.target.value)
              }
              rows={4}
              placeholder="Describe your project..."
              className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md resize-none w-full focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectForm;