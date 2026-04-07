import React from "react";

const OptionButton = ({
  option,
  isSelected,
  isSubmitted,
  isCorrect,
  isWrong,
  onClick
}) => {
  let styles =
    "border-white/10 bg-neutral-900/40 text-neutral-300 hover:border-orange-500/40 hover:bg-neutral-800/60";

  if (isSubmitted) {
    if (isCorrect) {
      styles =
        "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
    } else if (isWrong) {
      styles =
        "border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
    } else {
      styles =
        "border-white/5 bg-transparent text-neutral-600 cursor-not-allowed";
    }
  } else if (isSelected) {
    styles =
      "border-orange-500 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]";
  }

  return (
    <button
      disabled={isSubmitted}
      onClick={onClick}
      className={`w-full text-left p-3 md:p-3.5 rounded-xl border transition-all flex items-center justify-between text-sm font-semibold ${styles}`}
    >
      {/* Option Text */}
      <span className="leading-snug">{option}</span>

      {/* Right Indicator */}
      <div className="flex items-center ml-3">

        {/* Correct */}
        {isSubmitted && isCorrect && (
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[11px] font-bold">
            ✓
          </span>
        )}

        {/* Wrong */}
        {isSubmitted && isWrong && (
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold">
            ✕
          </span>
        )}

        {/* Radio Indicator */}
        {!isSubmitted && (
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center bg-black/50 ${
              isSelected
                ? "border-orange-500"
                : "border-white/20"
            }`}
          >
            {isSelected && (
              <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full" />
            )}
          </div>
        )}
      </div>
    </button>
  );
};

export default OptionButton;
