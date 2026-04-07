import React from "react";

const Breadcrumbs = ({ activeTopic }) => {
  return (
    <div className="flex items-center mb-4">

      <div className="flex items-center gap-2 px-4 py-2 glass-panel border border-white/10 rounded-xl shadow-sm">

        <span className="text-sm font-semibold text-neutral-400 hover:text-white transition">
          Dashboard
        </span>

        <span className="text-neutral-600 text-xs">/</span>

        <span className="text-sm font-semibold text-neutral-400 hover:text-white transition">
          Aptitude
        </span>

        <span className="text-neutral-600 text-xs">/</span>

        <span className="text-sm font-bold text-white uppercase tracking-wide">
          {activeTopic || "All Questions"}
        </span>

      </div>
    </div>
  );
};

export default Breadcrumbs;
