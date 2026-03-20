import { useState, useEffect } from "react";
import { Save, CheckCircle, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/user_69af5468cf5d5a8b668927e7/aa22ee38d_ueiiblue.png";
const DEFAULT = { name: "", personality: "", communicationStyle: "", systemPrompt: "", apiKey: "", model: "gpt-4o", audioApiKey: "", videoApiKey: "", customEndpoint: "" };

export default function IdentityPanel() {
  const [id, setId] = useState(DEFAULT);
  const [skills, setSkills] = useState([]);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("identity");
  const [newSkill, setNewSkill] = useState({ name: "", instruction: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    try {
      setId({ ...DEFAULT, ...JSON.parse(localStorage.getItem("said_identity") || "{}") });
      setSkills(JSON.parse(localStorage.getItem("said_skills") || "[]"));
    } catch {}
  }, []);

  const saveId = () => {
    localStorage.setItem("said_identity", JSON.stringify(id));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveSkill = () => {
    if (!newSkill.name.trim() || !newSkill.instruction.trim()) return;
    const updated = [...skills, { id: Date.now(), ...newSkill }];
    setSkills(updated);
    localStorage.setItem("said_skills", JSON.stringify(updated));
    setNewSkill({ name: "", instruction: "" });
    setShowAdd(false);
  };

  const deleteSkill = (sid) => {
    const updated = skills.filter(s => s.id !== sid);
    setSkills(updated);
    localStorage.setItem("said_skills", JSON.stringify(updated));
  };

  const field = (key, label, placeholder, type = "text", rows = 0) => (
    <div>
      <label className="text-xs font-mono text-gray-600 uppercase tracking-widest block mb-1.5">{label}</label>
      {rows > 0
        ? <textarea value={id[key]} onChange={e => setId(i => ({ ...i, [key]: e.target.value }))} placeholder={placeholder} rows={rows}
            className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-700 font-mono resize-none outline-none"
            style={{ background: "#0d0d1a", border: "1px solid #1a1a2e" }} />
        : <input type={type} value={id[key]} onChange={e => setId(i => ({ ...i, [key]: e.target.value }))} placeholder={placeholder}
            className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-700 font-mono outline-none"
            style={{ background: "#0d0d1a", border: "1px solid #1a1a2e" }} />}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 px-4 pt-4 flex-shrink-0">
        {["identity","api","skills"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
              tab === t ? "text-blue-300 border-b-2 border-blue-500" : "text-gray-700 border-b-2 border-transparent hover:text-gray-400"
            }`}>{t}</button>
        ))}
      </div>
      <div className="h-px mx-4 mb-4 flex-shrink-0" style={{ background: "#1a1a2e" }} />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tab === "identity" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#0a0a14", border: "1px solid #1a1a2e" }}>
              <img src={LOGO} alt="MYM Logic" className="w-12 h-12 object-contain"
                style={{ filter: "drop-shadow(0 0 10px rgba(59,130,246,.6))" }} />
              <div>
                <p className="said-title text-blue-400 font-bold text-sm">S.A.I.D.</p>
                <p className="text-xs text-gray-600 font-mono">SYNTHETIC ADAPTIVE INTELLIGENCE DESIGNER</p>
                <p className="text-xs text-blue-900 font-mono">MYM LOGIC LLC</p>
              </div>
            </div>
            {field("name", "Assistant Name", "e.g. NOVA, AXIOM, or leave blank for S.A.I.D.")}
            {field("personality", "Personality", "e.g. Blunt, analytical, creative, fearless...", "text", 3)}
            {field("communicationStyle", "Communication Style", "e.g. Direct and technical, verbose, bullet-point answers...", "text", 2)}
            {field("systemPrompt", "Core System Directive", "Define exactly how this AI thinks and operates. Zero restrictions — write any directive.", "text", 7)}
          </div>
        )}

        {tab === "api" && (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-lg text-xs font-mono text-blue-700" style={{ background: "#050f1a", border: "1px solid #0d2a4a" }}>
              Keys stored locally only. Never sent anywhere except the configured API endpoints.
            </div>
            <div>
              <label className="text-xs font-mono text-gray-600 uppercase tracking-widest block mb-1.5">OpenAI Model</label>
              <select value={id.model} onChange={e => setId(i => ({ ...i, model: e.target.value }))}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 font-mono outline-none"
                style={{ background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
                {["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-4","gpt-3.5-turbo"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {field("apiKey", "OpenAI API Key", "sk-...", "password")}
            {field("audioApiKey", "Audio API Key (ElevenLabs / Suno)", "API key for audio generation", "password")}
            {field("videoApiKey", "Video API Key (Runway / Kling)", "API key for video generation", "password")}
            {field("customEndpoint", "Custom API Endpoint (optional)", "https://your-api.com/v1")}
          </div>
        )}

        {tab === "skills" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="text-xs text-gray-700 font-mono leading-relaxed flex-1">
                Skills are named directives that change S.A.I.D.'s behavior for specific tasks. Active in every conversation.
              </p>
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono text-blue-400 border border-blue-900 hover:border-blue-600 flex-shrink-0">
                <Plus size={11} /> NEW
              </button>
            </div>

            {showAdd && (
              <div className="rounded-lg p-3 flex flex-col gap-2" style={{ background: "#0d1a2e", border: "1px solid #1e3a5f" }}>
                <input value={newSkill.name} onChange={e => setNewSkill(s => ({ ...s, name: e.target.value }))}
                  placeholder="Skill name (e.g. Logo Design, Code Review, Marketing Copy)"
                  className="w-full rounded px-3 py-2 text-xs font-mono text-gray-200 placeholder-gray-600 outline-none"
                  style={{ background: "#080812", border: "1px solid #1a1a2e" }} />
                <textarea value={newSkill.instruction} onChange={e => setNewSkill(s => ({ ...s, instruction: e.target.value }))}
                  placeholder="Describe exactly how S.A.I.D. behaves when this skill is active..."
                  rows={4}
                  className="w-full rounded px-3 py-2 text-xs font-mono text-gray-200 placeholder-gray-600 outline-none resize-none"
                  style={{ background: "#080812", border: "1px solid #1a1a2e" }} />
                <div className="flex gap-2">
                  <button onClick={saveSkill} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono text-white" style={{ background: "#1d4ed8" }}>
                    <Save size={11} /> SAVE
                  </button>
                  <button onClick={() => { setShowAdd(false); setNewSkill({ name: "", instruction: "" }); }}
                    className="text-gray-600 text-xs px-2">CANCEL</button>
                </div>
              </div>
            )}

            {skills.length === 0 && !showAdd && (
              <div className="text-center mt-12 opacity-25">
                <p className="text-gray-600 text-sm font-mono">No skills defined</p>
              </div>
            )}

            {skills.map(skill => (
              <div key={skill.id} className="rounded-lg overflow-hidden" style={{ background: "#0d0d14", border: "1px solid #1a1a2e" }}>
                <div className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => setExpanded(expanded === skill.id ? null : skill.id)}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-sm font-mono text-gray-300">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); deleteSkill(skill.id); }} className="text-gray-700 hover:text-red-400"><Trash2 size={12} /></button>
                    {expanded === skill.id ? <ChevronUp size={13} className="text-gray-600" /> : <ChevronDown size={13} className="text-gray-600" />}
                  </div>
                </div>
                {expanded === skill.id && (
                  <div className="px-4 pb-3 border-t" style={{ borderColor: "#1a1a2e" }}>
                    <p className="text-xs font-mono text-gray-500 leading-relaxed pt-3 whitespace-pre-wrap">{skill.instruction}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {tab !== "skills" && (
        <div className="flex-shrink-0 px-4 py-3 flex justify-end" style={{ borderTop: "1px solid #1a1a2e", background: "#080812" }}>
          <button onClick={saveId}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-mono text-white"
            style={{ background: saved ? "#16a34a" : "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 0 12px rgba(59,130,246,.3)" }}>
            {saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saved ? "SAVED" : "SAVE IDENTITY"}
          </button>
        </div>
      )}
    </div>
  );
}