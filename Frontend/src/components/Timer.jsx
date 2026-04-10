// This timer is a lightweight practice companion for the IDE page.
// It is intentionally local-only, so users can start, pause, or reset without hitting the backend.
import { useState, useEffect } from "react";
import { PlayIcon, PauseIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export default function Timer({ compact = false }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval;

    if (running) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [running]);

  const formatTime = () => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const wrapperClassName = compact
    ? "flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-950/90 px-3 py-1.5 text-white shadow-lg"
    : "flex items-center gap-3 bg-neutral-900 text-white px-4 py-2 rounded-full shadow-lg w-fit";
  const timeClassName = compact
    ? "font-mono text-sm font-semibold tracking-[0.18em]"
    : "font-mono text-lg tracking-wide";
  const iconClassName = compact ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className={wrapperClassName}>
      <span className={timeClassName}>
        {formatTime()}
      </span>

      {!running ? (
        <button onClick={() => setRunning(true)} className="text-green-400 hover:text-green-300 transition">
          <PlayIcon className={iconClassName} />
        </button>
      ) : (
        <button onClick={() => setRunning(false)} className="text-yellow-400 hover:text-yellow-300 transition">
          <PauseIcon className={iconClassName} />
        </button>
      )}

      <button onClick={() => { setRunning(false); setSeconds(0);} } className="text-gray-400 hover:text-gray-200 transition">
        <ArrowPathIcon className={iconClassName} />
      </button>
    </div>
  );
}
