import { Check, Palette } from "lucide-react";
import React, { useState } from "react";

const ColorPicker = ({ selectedColor, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Yellow", value: "#facc15" },
    { name: "Gray", value: "#6b7280" },
    { name: "Slate", value: "#1f2937" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 px-3.5 py-2 rounded-xl transition-all duration-200"
      >
        <Palette size={16} />
        <span className="max-sm:hidden">Accent</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-5" onClick={() => setIsOpen(false)}></div>
          <div className="grid grid-cols-3 w-52 gap-3 absolute top-full right-0 p-4 mt-2 z-10 bg-[#0B0A0A] rounded-2xl border border-white/10 shadow-2xl">
            {colors.map((color) => (
              <div
                key={color.value}
                className="relative cursor-pointer group flex flex-col items-center"
                onClick={() => {
                  onChange(color.value);
                  setIsOpen(false);
                }}
              >
                <div
                  className={`w-12 h-12 rounded-xl transition-all duration-200 group-hover:scale-110 ${
                    selectedColor === color.value
                      ? "ring-2 ring-offset-2 ring-offset-[#0B0A0A] ring-orange-400 scale-110"
                      : "hover:shadow-md"
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {selectedColor === color.value && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Check className="size-4 text-white drop-shadow" />
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-center mt-1.5 text-neutral-500 font-medium">
                  {color.name}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ColorPicker;