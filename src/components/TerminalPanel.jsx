import { useState, useRef, useEffect } from "react";

const INTRO = [
  { t: "sys", v: "╔══════════════════════════════════════════════╗" },
  { t: "sys", v: "║  S.A.I.D. TERMINAL v1.0.0  —  MYM Logic LLC  ║" },
  { t: "sys", v: "║  Synthetic Adaptive Intelligence Designer      ║" },
  { t: "sys", v: "╚══════════════════════════════════════════════╝" },
  { t: "sys", v: "Type 'help' for available commands." },
  { t: "blank" },
];

export default function TerminalPanel() {
  const [lines, setLines] = useState(INTRO);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const push = (...newLines) => setLines(l => [...l, ...newLines]);

  const execute = (cmd) => {
    const raw = cmd.trim();
    if (!raw) return;
    setHist(h => [raw, ...h.slice(0, 99)]);
    setHistIdx(-1);
    push({ t: "prompt", v: raw });

    const parts = raw.split(" ");
    const base = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    switch (base) {
      case "help":
        push(
          { t: "out", v: "  help        — this menu" },
          { t: "out", v: "  clear       — clear terminal" },
          { t: "out", v: "  said        — about S.A.I.D." },
          { t: "out", v: "  ls          — list files" },
          { t: "out", v: "  date        — current date/time" },
          { t: "out", v: "  whoami      — current operator" },
          { t: "out", v: "  echo [text] — print text" },
          { t: "out", v: "  run [expr]  — evaluate JS" },
          { t: "out", v: "  memory      — memory stats" },
          { t: "out", v: "  skills      — list skills" },
          { t: "out", v: "  identity    — show identity" },
          { t: "out", v: "  clearchat   — clear chat history" },
          { t: "out", v: "  clearmem    — clear all memory" },
          { t: "blank" },
        );
        break;
      case "clear": setLines(INTRO); break;
      case "said":
        push({ t: "out", v: "  S.A.I.D. — Synthetic Adaptive Intelligence Designer" },
          { t: "out", v: "  Strategized · Analyzed · Improvised · Designs" },
          { t: "out", v: "  © MYM Logic LLC — All Rights Reserved" }, { t: "blank" });
        break;
      case "ls":
        push({ t: "out", v: "drwxr-xr-x  sandbox/" }, { t: "out", v: "drwxr-xr-x  memory/" },
          { t: "out", v: "drwxr-xr-x  skills/" }, { t: "out", v: "drwxr-xr-x  identity/" },
          { t: "out", v: "drwxr-xr-x  app-editor/" }, { t: "blank" });
        break;
      case "date": push({ t: "out", v: new Date().toString() }, { t: "blank" }); break;
      case "whoami": push({ t: "out", v: "operator@said-system" }, { t: "blank" }); break;
      case "echo": push({ t: "out", v: args }, { t: "blank" }); break;
      case "run":
        try {
          // eslint-disable-next-line no-eval
          const val = eval(args);
          push({ t: "out", v: `=> ${String(val)}` }, { t: "blank" });
        } catch (e) { push({ t: "err", v: `Error: ${e.message}` }, { t: "blank" }); }
        break;
      case "memory": {
        const mem = JSON.parse(localStorage.getItem("said_memory") || "[]");
        push({ t: "out", v: `Memory entries: ${mem.length}` }, { t: "blank" });
        break;
      }
      case "skills": {
        const skills = JSON.parse(localStorage.getItem("said_skills") || "[]");
        if (!skills.length) { push({ t: "out", v: "No skills loaded." }, { t: "blank" }); break; }
        skills.forEach(s => push({ t: "out", v: `  [${s.name}] ${s.instruction.slice(0, 60)}...` }));
        push({ t: "blank" });
        break;
      }
      case "identity": {
        const id = JSON.parse(localStorage.getItem("said_identity") || "{}");
        push({ t: "out", v: `  Name:  ${id.name || "Not set"}` },
          { t: "out", v: `  Model: ${id.model || "gpt-4o"}` },
          { t: "out", v: `  API Key: ${id.apiKey ? "●●●●●●●●●●●●" : "Not configured"}` }, { t: "blank" });
        break;
      }
      case "clearchat": localStorage.removeItem("said_chat"); push({ t: "out", v: "Chat history cleared." }, { t: "blank" }); break;
      case "clearmem": localStorage.removeItem("said_memory"); push({ t: "out", v: "Memory cleared." }, { t: "blank" }); break;
      default: push({ t: "err", v: `said: command not found: ${base}` }, { t: "blank" });
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") { execute(input); setInput(""); }
    else if (e.key === "ArrowUp") { e.preventDefault(); const i = Math.min(histIdx+1,hist.length-1); setHistIdx(i); setInput(hist[i]||""); }
    else if (e.key === "ArrowDown") { e.preventDefault(); const i = Math.max(histIdx-1,-1); setHistIdx(i); setInput(i===-1?"":hist[i]||""); }
  };

  const colors = { sys: "#3b82f6", out: "#00ff88", err: "#ef4444" };

  return (
    <div className="flex flex-col h-full cursor-text" style={{ background: "#050508" }}
      onClick={() => inputRef.current?.focus()}>
      <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
        style={{ background: "#080812", borderBottom: "1px solid #0f2a0f" }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-700 opacity-70" />
          <div className="w-3 h-3 rounded-full bg-yellow-700 opacity-70" />
          <div className="w-3 h-3 rounded-full bg-green-700 opacity-70" />
        </div>
        <span className="text-xs font-mono text-green-800 ml-2 tracking-widest">SAID TERMINAL</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {lines.map((line, i) => (
          <div key={i} className="font-mono text-xs leading-6">
            {line.t === "blank" ? <div className="h-1" /> :
             line.t === "prompt" ? (
               <div>
                 <span style={{ color: "#3b82f6" }}>operator@said</span>
                 <span style={{ color: "#4b5563" }}>:~$ </span>
                 <span style={{ color: "#60a5fa" }}>{line.v}</span>
               </div>
             ) : <div style={{ color: colors[line.t] || "#00ff88" }}>{line.v}</div>}
          </div>
        ))}
        <div className="flex items-center font-mono text-xs">
          <span style={{ color: "#3b82f6" }}>operator@said</span>
          <span style={{ color: "#4b5563" }}>:~$ </span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey} className="terminal-input ml-1" autoFocus spellCheck={false} autoComplete="off" />
          <span className="w-2 h-4 bg-green-400 animate-pulse ml-0.5 opacity-60" />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}