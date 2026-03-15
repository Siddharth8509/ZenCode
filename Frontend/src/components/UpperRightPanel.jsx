// UpperRightPanel wraps Monaco so the main problem page does not have to care about editor setup details.
// It handles language switching and keeps the editor laid out correctly inside resizable panels.
import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";

export default function UpperRightPanle({ prop, code, setCode, language, setLanguage }) {
  const editorRef = useRef(null);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      editorRef.current?.layout();
    });

    const container = document.getElementById("editor-wrapper");
    if (container) resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="h-full min-h-0 flex flex-col">

      {/* Toolbar */}
      <div className="h-10 bg-transparent flex items-center justify-between px-3 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Language:</span>
          <select
            className="select select-sm select-ghost w-32 text-neutral-300 focus:bg-neutral-800 focus:text-white"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>
        </div>

        <div className="text-xs text-neutral-500 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
          Auto-saved
        </div>
      </div>

      {/* Editor */}
      <div id="editor-wrapper" className="flex-1 overflow-hidden min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            scrollbar: {
              vertical: "hidden",
              horizontal: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}
