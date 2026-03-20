import { MessageSquare, Code2, Terminal, Wand2, FolderOpen, Brain, User, Zap, FileCode2 } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/user_69af5468cf5d5a8b668927e7/aa22ee38d_ueiiblue.png";

const NAV = [
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "sandbox", icon: Code2, label: "Sandbox" },
  { id: "terminal", icon: Terminal, label: "Terminal" },
  { id: "generate", icon: Wand2, label: "Generate" },
  { id: "files", icon: FolderOpen, label: "Files" },
  { id: "editor", icon: FileCode2, label: "App Edit" },
  { id: "memory", icon: Brain, label: "Memory" },
  { id: "identity", icon: User, label: "Identity" },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="flex flex-col w-16 flex-shrink-0"
      style={{ background: "#080812", borderRight: "1px solid #1a1a2e", height: "100vh" }}>
      <div className="flex items-center justify-center py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid #1a1a2e" }}>
        <img src={LOGO} alt="MYM Logic" className="w-9 h-9 object-contain"
          style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.7))" }} />
      </div>
      <nav className="flex-1 flex flex-col gap-0.5 py-2 px-1 overflow-y-auto">
        {NAV.map((item) => (
          <button key={item.id} onClick={() => onSelect(item.id)}
            className={`sidebar-item flex flex-col items-center gap-1 py-2.5 px-1 rounded-md w-full ${
              active === item.id ? "sidebar-item-active" : "text-gray-600"
            }`} title={item.label}>
            <item.icon size={15} />
            <span className="text-[9px] font-mono tracking-wider uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="flex justify-center pb-3">
        <Zap size={11} className="text-blue-900" />
      </div>
    </aside>
  );
}