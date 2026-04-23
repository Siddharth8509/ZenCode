import { Plus, ShieldCheck, Trash2 } from "lucide-react";

const CertificationForm = ({ data, onChange }) => {
  const certifications = data || [];

  const addCertification = () => {
    const newCertification = {
      certificate_name: "",
      description: "",
      issuer: "",
      issue_date: "",
      credential_url: "",
    };
    onChange([...certifications, newCertification]);
  };

  const removeCertification = (index) => {
    const updated = certifications.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Certification
          </h3>
          <p className="text-sm text-neutral-400">
            Add your Certification details
          </p>
        </div>

        <button
          onClick={addCertification}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
        >
          <Plus className="size-4" />
          Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <p>No Certification added yet.</p>
          <p className="text-sm">Click "Add Certification" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((certification, index) => (
            <div
              key={index}
              className="p-4 border border-white/10 bg-black/20 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-start">
                <h4 className="text-white font-medium">Certification #{index + 1}</h4>
                <button
                  className="text-red-500 hover:text-red-400 transition-colors"
                  onClick={() => removeCertification(index)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  value={certification.certificate_name || ""}
                  onChange={(e) =>
                    updateCertification(index, "certificate_name", e.target.value)
                  }
                  type="text"
                  placeholder="Certificate Name"
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />

                <input
                  value={certification.issuer || ""}
                  onChange={(e) =>
                    updateCertification(index, "issuer", e.target.value)
                  }
                  type="text"
                  placeholder="Issuer"
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />

                <input
                  value={certification.credential_url || ""}
                  onChange={(e) =>
                    updateCertification(index, "credential_url", e.target.value)
                  }
                  type="text"
                  placeholder="Credential Url"
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />

                <input
                  value={certification.issue_date || ""}
                  onChange={(e) =>
                    updateCertification(index, "issue_date", e.target.value)
                  }
                  type="month"
                  className="px-3 py-2 text-sm border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:bg-white/5 disabled:opacity-50"
                />
              </div>

              <input
                value={certification.description || ""}
                onChange={(e) =>
                  updateCertification(index, "description", e.target.value)
                }
                type="text"
                placeholder="Description"
                className="px-3 py-2 text-sm w-full border border-white/10 bg-black/40 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificationForm;