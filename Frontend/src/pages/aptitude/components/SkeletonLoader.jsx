import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="glass-panel p-4 rounded-[20px] border border-white/10 flex items-center justify-between"
        >
          <div className="flex items-start gap-4 w-full">

            {/* Index Skeleton */}
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10"></div>

            <div className="flex-1 space-y-2 mt-1">

              {/* Question Text */}
              <div className="h-4 bg-white/10 rounded-md w-3/4"></div>
              <div className="h-4 bg-white/10 rounded-md w-1/2"></div>

              {/* Tags */}
              <div className="flex gap-2 mt-4">
                <div className="h-6 w-16 bg-white/5 rounded-lg border border-white/10"></div>
                <div className="h-6 w-20 bg-white/5 rounded-lg border border-white/10"></div>
                <div className="h-6 w-14 bg-white/5 rounded-lg border border-white/10"></div>
              </div>

            </div>
          </div>

          {/* CTA Skeleton */}
          <div className="hidden md:block">
            <div className="h-4 w-14 bg-white/5 rounded"></div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
