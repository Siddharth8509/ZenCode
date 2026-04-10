import { Suspense, lazy } from "react";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import LeftPanel from "./LeftPanel";
import BottomRight from "./BottomRight";

const UpperRightPanel = lazy(() => import("./UpperRightPanel"));

function ResizeHandle({ horizontal = false }) {
  return (
    <PanelResizeHandle
      className={`group relative bg-white/5 transition-colors hover:bg-orange-500/40 ${horizontal ? "h-1" : "w-1"}`}
    >
      <span
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 transition-colors group-hover:bg-orange-300 ${horizontal ? "h-0.5 w-10" : "h-10 w-0.5"}`}
      />
    </PanelResizeHandle>
  );
}

function EditorPanelFallback() {
  return (
    <div className="h-full min-h-0 flex items-center justify-center bg-neutral-950 text-neutral-400 text-sm">
      Loading editor...
    </div>
  );
}

export default function CodeEditor({
  problem,
  code,
  language,
  onCodeChange,
  onLanguageChange,
  output,
}) {
  const setCode = typeof onCodeChange === "function" ? onCodeChange : () => undefined;
  const setLanguage = typeof onLanguageChange === "function" ? onLanguageChange : () => undefined;

  return (
    <div className="h-full w-full bg-black text-white">
      <div className="hidden h-full lg:block">
        <PanelGroup orientation="horizontal" className="h-full">
          <Panel defaultSize="46%" minSize="28%">
            <LeftPanel prop={problem} code={code} language={language} />
          </Panel>

          <ResizeHandle />

          <Panel defaultSize="54%" minSize="30%">
            <PanelGroup orientation="vertical" className="h-full">
              <Panel defaultSize="62%" minSize="30%">
                <Suspense fallback={<EditorPanelFallback />}>
                  <UpperRightPanel
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={setLanguage}
                  />
                </Suspense>
              </Panel>

              <ResizeHandle horizontal />

              <Panel defaultSize="38%" minSize="18%">
                <BottomRight prop={problem} output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      <div className="h-full overflow-y-auto lg:hidden">
        <section className="min-h-[52vh] border-b border-white/10">
          <LeftPanel prop={problem} code={code} language={language} />
        </section>
        <section className="min-h-[48vh] border-b border-white/10">
          <Suspense fallback={<EditorPanelFallback />}>
            <UpperRightPanel
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
            />
          </Suspense>
        </section>
        <section className="min-h-[36vh]">
          <BottomRight prop={problem} output={output} />
        </section>
      </div>
    </div>
  );
}
