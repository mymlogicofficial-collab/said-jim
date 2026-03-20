import { useState, useEffect } from "react";
import { Brain, Plus, Trash2, Edit3, Save, X, Search } from "lucide-react";

export default function MemoryPanel() {
  const [memories, setMemories] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [newEntry, setNewEntry] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    try { setMemories(JSON.parse(localStorage.getItem("said_memory") || "[]")); } catch { setMemories([]); }
  }, []);

  const persist = (mem) => { setMemories(mem); localStorage.setItem("said_memory", JSON.stringify(mem)); };
  const addMemory = () => {
    if (!newEntry.trim()) return;
    persist([...memories, { id: Date.now(), content: newEntry.trim(), timestamp: new Date().toISOString(), source: "manual" }]);
    setNewEntry(""); setShowAdd(false);
  };
  const deleteMemory = (id) => persist(memories.filter(m => m.id !== id));
  const updateMemory = (id, content) => { persist(memories.map(m => m.id === id ? { ...m, content } : m)); setEditing(null); };
  const clearAll = () => { if (window.confirm("Clear all memories?")) persist([]); };

  const filtered = memories.filter(m => m.content.toLowerCase().includes(search.toLowerCase())).reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid #1a1a2e", background: "#080812" }}>
        <div className="flex items-center gap-2">
          <Brain size={15} className="text-blue-500" />
          <span className="text-sm font-mono text-gray-400">MEMORY</span>
          <span className="px-2 py-0.5 rounded text-xs font-mono text-gray-600" style={{ background: "#1a1a2e" }}>{memories.length}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono text-blue-400 border border-blue-900 hover:border-blue-600 transition-all">
            <Plus size={11} /> ADD
          </button>
          <button onClick={clearAll}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono text-red-700 border border-red-900 hover:border-red-700 transition-all">
            <Trash2 size={11} /> CLEAR
          </button>
        </div>
      </div>

      <div className="px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2 px-3 rounded-lg" style={{ background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <Search size={11} className="text-gray-700" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search memories..."
            className="flex-1 bg-transparent py-2 text-xs font-mono text-gray-300 placeholder-gray-700 outline-none" />
        </div>
      </div>

      {showAdd && (
        <div className="mx-4 mb-2 p-3 rounded-lg flex-shrink-0" style={{ background: "#0d1a2e", border: "1px solid #1e3a5f" }}>
          <textarea value={newEntry} onChange={e => setNewEntry(e.target.value)} placeholder="Enter memory or context..."
            rows={3} autoFocus className="w-full bg-transparent text-xs font-mono text-gray-200 placeholder-gray-600 outline-none resize-none" />
          <div className="flex gap-2 mt-2">
            <button onClick={addMemory} className="flex items-center gap-1 px-3 py-1 rounded text-xs font-mono text-white" style={{ background: "#1d4ed8" }}>
              <Save size={10} /> SAVE
            </button>
            <button onClick={() => { setShowAdd(false); setNewEntry(""); }} className="text-gray-500 text-xs px-2"><X size={10} /></button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {filtered.length === 0
          ? <div className="text-center mt-16 opacity-25"><Brain size={36} className="text-blue-900 mx-auto mb-3" /><p className="text-gray-600 text-xs font-mono">{search ? "No matches" : "No memories"}</p></div>
          : filtered.map(mem => (
            <div key={mem.id} className="rounded-lg p-3 mb-2 group" style={{ background: "#0d0d14", border: "1px solid #1a1a2e" }}>
              {editing?.id === mem.id ? (
                <div>
                  <textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })}
                    rows={3} autoFocus className="w-full bg-transparent text-xs font-mono text-gray-200 outline-none resize-none" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateMemory(mem.id, editing.content)} className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-white" style={{ background: "#1d4ed8" }}><Save size={10} /> SAVE</button>
                    <button onClick={() => setEditing(null)} className="text-gray-600"><X size={10} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">{mem.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-mono text-gray-700">{new Date(mem.timestamp).toLocaleString()} · {mem.source}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing({ id: mem.id, content: mem.content })} className="text-gray-700 hover:text-blue-400"><Edit3 size={11} /></button>
                      <button onClick={() => deleteMemory(mem.id)} className="text-gray-700 hover:text-red-400"><Trash2 size={11} /></button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}