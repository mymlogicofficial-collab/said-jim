import { useState } from "react";
import { Play, Download, Maximize2, RefreshCw, Code2, Eye } from "lucide-react";

const STARTER = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>S.A.I.D. Sandbox</title>
  <style>
    body { margin:0; background:#050508; color:#e2e8f0; font-family:'Inter',sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; flex-direction:column; gap:16px; }
    h1 { font-size:2.5rem; letter-spacing:.4em; color:#3b82f6; text-shadow:0 0 30px rgba(59,130,246,.8); }
    p { color:#6b7280; font-size:.875rem; font-family:monospace; }
  </style>
</head>
<body>
  <h1>S.A.I.D.</h1>
  <p>Sandbox active — start building here</p>
  <script>
    console.log('S.A.I.D. Sandbox ready');
  </script>
</body>
</html>`;

export default function SandboxPanel() {
  const [code, setCode] = useState(STARTER);
  const [preview, setPreview] = useState(STARTER);
  const [view, setView] = useState("split");

  const runCode = () => setPreview(code);

  const exportHTML = () => {
    const blob = new Blob([code], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "said_design.html";
    a.click();
  };

  const openInBrowser = () => {
    const blob = new Blob([code], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
        style={{ background: "#080812", borderBottom: "1px solid #1a1a2e" }}>
        <div className="flex gap-1">
          {["split","code","preview"].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 text-xs font-mono rounded uppercase transition-all ${
                view === v ? "bg-blue-900 text-blue-300 border border-blue-700" : "text-gray-600 hover:text-gray-400"
              }`}>
              {v === "split" ? <span className="flex items-center gap-1"><Code2 size={9}/><Eye size={9}/></span> : v}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={runCode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-white"
          style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 0 10px rgba(59,130,246,.3)" }}>
          <Play size={11} /> RUN
        </button>
        <button onClick={openInBrowser}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-blue-300 border border-blue-900 hover:border-blue-600 transition-all">
          <Maximize2 size={11} /> BROWSER
        </button>
        <button onClick={exportHTML}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-gray-400 border border-gray-800 hover:border-gray-600 transition-all">
          <Download size={11} /> EXPORT
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Editor */}
        {(view === "split" || view === "code") && (
          <div className={`flex flex-col ${view === "split" ? "w-1/2 border-r border-gray-900" : "w-full"}`}>
            <div className="flex items-center px-3 py-1.5 flex-shrink-0"
              style={{ background: "#080812", borderBottom: "1px solid #1a1a2e" }}>
              <span className="text-xs font-mono text-gray-700 uppercase tracking-widest">HTML / CSS / JS</span>
            </div>
            <div className="flex-1 overflow-auto" style={{ background: "#080812" }}>
              <div className="flex min-h-full">
                <div className="text-right pr-3 pt-3 select-none text-gray-800 font-mono text-xs leading-6 flex-shrink-0"
                  style={{ minWidth: "40px", background: "#06060f", borderRight: "1px solid #111122" }}>
                  {code.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <textarea value={code} onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                  className="code-editor flex-1 p-3 text-xs leading-6"
                  style={{ minHeight: "100%", background: "#080812" }} />
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {(view === "split" || view === "preview") && (
          <div className={`flex flex-col ${view === "split" ? "w-1/2" : "w-full"}`}>
            <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0"
              style={{ background: "#080812", borderBottom: "1px solid #1a1a2e" }}>
              <span className="text-xs font-mono text-gray-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                LIVE PREVIEW
              </span>
              <button onClick={runCode}><RefreshCw size={11} className="text-gray-700 hover:text-blue-400 transition-colors" /></button>
            </div>
            <div className="flex-1 overflow-hidden bg-white">
              <iframe srcDoc={preview} title="preview" style={{ border: "none", width: "100%", height: "100%" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}