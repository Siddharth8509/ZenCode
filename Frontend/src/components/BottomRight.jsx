import { useState, useEffect, useMemo } from "react";

export default function BottomRight({ prop, output }) {
  const visibleTestCases = useMemo(() => {
    const cases = Array.isArray(prop?.visibleTestCase) ? prop.visibleTestCase : [];
    return cases.slice(0, 2);
  }, [prop?.visibleTestCase]);

  const [activeTab, setActiveTab] = useState("testcase");
  const [activeCase, setActiveCase] = useState(0);

  useEffect(() => {
    if (output && (output.type === 'run' || output.type === 'submit' || output.type === 'error')) {
      setActiveTab("result");
    }
  }, [output]);

  const TABS = [
    { id: "testcase", label: "Test Cases" },
    { id: "result", label: "Result" },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-black overflow-hidden rounded-xl">
      {/* Tabs */}
      <div className="flex items-center h-11 px-4 border-b border-white/5 gap-1 bg-black/80 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-full px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.id
              ? "text-orange-300 border-orange-400 bg-orange-500/10"
              : "text-neutral-400 border-transparent hover:text-neutral-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {activeTab === "testcase" && (
          <>
            <div className="flex gap-2">
              {visibleTestCases.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCase(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeCase === idx
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                    : "bg-neutral-900/70 text-neutral-400 border border-white/10 hover:border-orange-500/40"
                    }`}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>

            {visibleTestCases[activeCase] && (
              <div className="rounded-xl bg-neutral-900/80 border border-white/10 p-4 space-y-3">
                <div className="text-xs text-neutral-500 uppercase tracking-[0.2em]">Input</div>
                <pre className="text-sm text-neutral-200 font-mono whitespace-pre-wrap">
                  {visibleTestCases[activeCase].input}
                </pre>
                <div className="text-xs text-neutral-500 uppercase tracking-[0.2em] pt-2 border-t border-white/5">
                  Expected Output
                </div>
                <pre className="text-sm text-emerald-300 font-mono whitespace-pre-wrap">
                  {visibleTestCases[activeCase].output}
                </pre>
              </div>
            )}

            {visibleTestCases.length === 0 && (
              <p className="text-sm text-neutral-500">No test cases available.</p>
            )}
          </>
        )}

        {activeTab === "result" && (
          <div className="space-y-4">
            {!output && (
              <p className="text-sm text-neutral-500">
                Run or submit your code to see results.
              </p>
            )}

            {output && output.type === 'error' && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                <div className="text-lg font-semibold text-rose-300 mb-2">Error</div>
                <pre className="text-sm text-rose-200 font-mono whitespace-pre-wrap">
                  {output.errorMessage || "An error occurred"}
                </pre>
              </div>
            )}

            {output && output.type === 'run' && (
              <div className="space-y-4">
                <div
                  className={`text-xl font-semibold ${output.problemStatus === "accepted"
                    ? "text-emerald-300"
                    : "text-rose-300"
                    }`}
                >
                  {output.problemStatus?.replace("_", " ") || "Run complete"}
                </div>

                {(output.runtime != null || output.memory != null) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-4">
                      <div className="text-xs text-neutral-500 uppercase">Runtime</div>
                      <div className="text-lg font-semibold text-white">
                        {output.runtime ?? "-"} ms
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-4">
                      <div className="text-xs text-neutral-500 uppercase">Memory</div>
                      <div className="text-lg font-semibold text-white">
                        {output.memory ?? "-"} KB
                      </div>
                    </div>
                  </div>
                )}

                {output.errorMessage && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200 text-sm">
                    {output.errorMessage}
                  </div>
                )}
              </div>
            )}

            {output && output.type === 'submit' && (
              <div className="space-y-4">
                <div
                  className={`text-xl font-semibold ${(output.problemStatus || output.status) === "accepted"
                    ? "text-emerald-300"
                    : "text-rose-300"
                    }`}
                >
                  {(output.problemStatus || output.status)?.replace("_", " ") || "Submitted"}
                </div>

                {output.runtime != null && output.memory != null && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-4">
                      <div className="text-xs text-neutral-500 uppercase">Runtime</div>
                      <div className="text-lg font-semibold text-white">{output.runtime} ms</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-4">
                      <div className="text-xs text-neutral-500 uppercase">Memory</div>
                      <div className="text-lg font-semibold text-white">{output.memory} KB</div>
                    </div>
                  </div>
                )}

                {output.message && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200 text-sm">
                    {output.message}
                  </div>
                )}

                {output.errorMessage && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200 text-sm">
                    {output.errorMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
