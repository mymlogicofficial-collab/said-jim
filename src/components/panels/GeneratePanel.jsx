import { useState } from "react";
import { Image, Music, Video, Wand2, Download, Loader2 } from "lucide-react";

const TABS = [
  { id: "image", label: "Image", icon: Image },
  { id: "audio", label: "Audio", icon: Music },
  { id: "video", label: "Video", icon: Video },
];

export default function GeneratePanel() {
  const [tab, setTab] = useState("image");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cfg, setCfg] = useState({ model: "dall-e-3", size: "1024x1024", style: "vivid", quality: "standard" });

  const getApiKey = () => {
    try { return JSON.parse(localStorage.getItem("said_identity") || "{}").apiKey || ""; } catch { return ""; }
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    const apiKey = getApiKey();
    setLoading(true); setError(""); setResult(null);
    try {
      if (tab === "image") {
        if (!apiKey) throw new Error("No OpenAI API key. Set it in the Identity panel.");
        const res = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: cfg.model, prompt, n: 1, size: cfg.size, style: cfg.style, quality: cfg.quality }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        setResult({ type: "image", url: data.data[0].url, revised: data.data[0].revised_prompt });
      } else {
        throw new Error(`${tab.charAt(0).toUpperCase()+tab.slice(1)} generation requires a third-party API key. Configure it in the Identity panel under API Config.`);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 px-4 pt-4 flex-shrink-0">
        {TABS.map((tabItem) => (
          <button key={tabItem.id} onClick={() => { setTab(tabItem.id); setResult(null); setError(""); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-widest transition-all ${
              tab === tabItem.id ? "text-blue-300 border-b-2 border-blue-500" : "text-gray-600 border-b-2 border-transparent hover:text-gray-400"
            }`}>
            <tabItem.icon size={13} /> {tabItem.label}
          </button>
        ))}
      </div>
      <div className="h-px mx-4 mb-4" style={{ background: "#1a1a2e" }} />

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
        <div>
          <label className="text-xs font-mono text-gray-600 uppercase tracking-widest block mb-2">Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder={tab === "image" ? "Describe the image in detail..." : `Describe the ${tab} you want...`}
            rows={4}
            className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 font-mono resize-none outline-none"
            style={{ background: "#0d0d1a", border: "1px solid #1a1a2e" }} />
        </div>

        {tab === "image" && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "model", label: "Model", opts: ["dall-e-3", "dall-e-2"] },
              { key: "size", label: "Size", opts: cfg.model === "dall-e-3" ? ["1024x1024","1792x1024","1024x1792"] : ["256x256","512x512","1024x1024"] },
              { key: "style", label: "Style", opts: ["vivid","natural"] },
              { key: "quality", label: "Quality", opts: ["standard","hd"] },
            ].map(({ key, label, opts }) => (
              <div key={key}>
                <label className="text-xs font-mono text-gray-700 uppercase tracking-widest block mb-1">{label}</label>
                <select value={cfg[key]} onChange={e => setCfg(c => ({ ...c, [key]: e.target.value }))}
                  className="w-full rounded px-2 py-1.5 text-xs text-gray-300 font-mono outline-none"
                  style={{ background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        <button onClick={generate} disabled={loading || !prompt.trim()}
          className="flex items-center justify-center gap-2 py-3 rounded-lg font-mono text-sm font-bold disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 0 20px rgba(59,130,246,.25)" }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {loading ? "GENERATING..." : `GENERATE ${tab.toUpperCase()}`}
        </button>

        {error && (
          <div className="rounded-lg p-3 text-xs font-mono text-red-400"
            style={{ background: "#160808", border: "1px solid #3b0000" }}>{error}</div>
        )}

        {result?.type === "image" && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1a1a2e" }}>
            <div className="flex items-center justify-between px-3 py-2"
              style={{ background: "#080812", borderBottom: "1px solid #1a1a2e" }}>
              <span className="text-xs font-mono text-green-500">● IMAGE GENERATED</span>
              <a href={result.url} download="said_image.png" target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs font-mono text-blue-400 hover:text-blue-300">
                <Download size={11} /> SAVE
              </a>
            </div>
            <img src={result.url} alt="generated" className="w-full" />
            {result.revised && (
              <p className="text-xs text-gray-600 font-mono p-3 leading-relaxed">{result.revised}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}