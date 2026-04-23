import { Check, ChevronLeft, ChevronRight, Layout, X } from "lucide-react";
import { useRef, useState } from "react";
import dummyResumeData from "./dummyResumeData";

// Lazy-import all templates
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

const TemplateSelector = ({ selectedTemplate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -260 : 260,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 px-3.5 py-2 rounded-xl transition-all duration-200"
      >
        <Layout size={14} /> <span className="max-sm:hidden">Template</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Full-screen modal for template selection */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <div className="bg-[#0B0A0A] border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Choose a Template
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Pick a style that fits your profession
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="size-8 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="size-4 text-neutral-400" />
                </button>
              </div>

              {/* Scrollable grid with arrow buttons */}
              <div className="relative flex-1 overflow-hidden">
                {/* Left Arrow */}
                <button
                  onClick={() => scroll("left")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/80 border border-white/10 hover:border-orange-500/40 hover:bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition-all shadow-lg backdrop-blur"
                >
                  <ChevronLeft className="size-5" />
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => scroll("right")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/80 border border-white/10 hover:border-orange-500/40 hover:bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition-all shadow-lg backdrop-blur"
                >
                  <ChevronRight className="size-5" />
                </button>

                {/* Template Cards */}
                <div
                  ref={scrollRef}
                  className="flex gap-5 overflow-x-auto py-6 px-12 no-scrollbar scroll-smooth"
                >
                  {templates.map((template) => {
                    const TemplateComponent = templateComponents[template.id];
                    const isSelected = selectedTemplate === template.id;

                    return (
                      <div
                        key={template.id}
                        onClick={() => {
                          onChange(template.id);
                          setIsOpen(false);
                        }}
                        className={`group relative shrink-0 cursor-pointer transition-all duration-300 rounded-xl ${
                          isSelected
                            ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-[#0B0A0A] scale-[1.02]"
                            : "hover:ring-1 hover:ring-white/20 hover:ring-offset-1 hover:ring-offset-[#0B0A0A]"
                        }`}
                      >
                        {/* Mini Resume Preview */}
                        <div className="w-[220px] h-[310px] rounded-xl overflow-hidden border border-white/10 bg-white relative">
                          <div
                            className="origin-top-left absolute top-0 left-0"
                            style={{
                              transform: "scale(0.27)",
                              width: "815px",
                              height: "1150px",
                            }}
                          >
                            <TemplateComponent
                              data={dummyResumeData}
                              accentColor="#3b82f6"
                            />
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                        </div>

                        {/* Label */}
                        <div className="mt-3 flex items-center justify-between px-1">
                          <span
                            className={`text-sm font-medium ${
                              isSelected ? "text-orange-400" : "text-neutral-300"
                            }`}
                          >
                            {template.name}
                          </span>
                          {isSelected && (
                            <div className="size-5 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TemplateSelector;