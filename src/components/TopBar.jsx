export default function TopBar({ panel }) {
  return (
    <div className="flex items-center justify-between px-4 h-10 flex-shrink-0"
      style={{ background: "#0a0a12", borderBottom: "1px solid #1a1a2e" }}>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="said-title text-blue-400 text-sm font-bold tracking-widest">S.A.I.D.</span>
        <span className="text-gray-700 text-xs">·</span>
        <span className="text-gray-500 text-xs font-mono uppercase tracking-widest">{panel}</span>
      </div>
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="text-green-600">● ONLINE</span>
        <span className="text-gray-800">MYM LOGIC LLC</span>
      </div>
    </div>
  );
}