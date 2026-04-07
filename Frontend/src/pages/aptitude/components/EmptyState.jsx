import React from "react";

const EmptyState = ({ topic, onRefresh }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 glass-panel rounded-[20px] border border-dashed border-white/20 text-center">

      {/* Icon */}
      <div className="text-4xl mb-4 opacity-50">🔍</div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2">
        No Questions Found
      </h3>

      {/* Description */}
      <p className="text-sm text-neutral-400 max-w-sm">
        No questions available for{" "}
        <span className="font-semibold text-orange-400">
          "{topic || "this topic"}"
        </span>
        . Try another topic or refresh the page.
      </p>

      {/* Action Button */}
      <button
        onClick={onRefresh || (() => window.location.reload())}
        className="mt-6 px-6 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl text-sm font-bold hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-0.5"
      >
        Refresh Platform
      </button>

    </div>
  );
};

export default EmptyState;
