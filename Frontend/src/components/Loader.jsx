// Small shared loading state used across pages and panels.
// It keeps async empty states visually consistent.
export default function Loader({ message = "Loading data...", compact = false }) {
  return (
    <div className={`flex items-center justify-center ${compact ? "py-6" : "py-12"}`}>
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900/75 px-4 py-3">
        <span className="h-5 w-5 rounded-full border-2 border-neutral-600 border-t-orange-400 animate-spin" />
        <span className="text-sm text-neutral-300">{message}</span>
      </div>
    </div>
  );
}
