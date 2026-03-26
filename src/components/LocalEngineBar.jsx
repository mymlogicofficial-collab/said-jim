import { useState, useEffect } from "react";
import { localChatBridge } from "./localChatBridge";
import { Wifi, WifiOff, Loader2, Settings2, Check } from "lucide-react";

const STATUS_STYLE = {
  connected:    { color: "#22c55e", label: "LOCAL ENGINE CONNECTED",    Icon: Wifi },
  connecting:   { color: "#f59e0b", label: "CONNECTING...",             Icon: Loader2, spin: true },
  error:        { color: "#ef4444", label: "CONNECTION ERROR",          Icon: WifiOff },
  disconnected: { color: "#4b5563", label: "LOCAL ENGINE DISCONNECTED", Icon: WifiOff },
};

export default function LocalEngineBar({ onStatusChange }) {
  const [status, setStatus] = useState(localChatBridge.status);
  const [showSettings, setShowSettings] = useState(false);
  const [port, setPort] = useState(String(localChatBridge.port || 5000));

  useEffect(() => {
    localChatBridge.onStatusChange = (s) => {
      setStatus(s);
      onStatusChange?.(s);
    };
    return () => { localChatBridge.onStatusChange = null; };
  }, [onStatusChange]);

  const connect = () => {
    localChatBridge.connect(parseInt(port, 10));
    setShowSettings(false);
  };

  const disconnect = () => localChatBridge.disconnect();

  const cfg = STATUS_STYLE[status] || STATUS_STYLE.disconnected;
  const StatusIcon = cfg.Icon;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0"
      style={{ background: "#06060e", borderBottom: "1px solid #111120" }}>
      <StatusIcon size={11} className={cfg.spin ? "animate-spin" : ""} style={{ color: cfg.color }} />
      <span className="text-[10px] font-mono tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>

      <div className="flex-1" />

      {showSettings ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-gray-600">ws://localhost:</span>
          <input value={port} onChange={e => setPort(e.target.value)}
            onKeyDown={e => e.key === "Enter" && connect()}
            className="w-16 bg-transparent text-[10px] font-mono text-gray-300 outline-none border-b border-blue-800 text-center"
            placeholder="5000" />
          <button onClick={connect}
            className="px-2 py-0.5 rounded text-[10px] font-mono text-white"
            style={{ background: "#1d4ed8" }}>
            <Check size={10} />
          </button>
          <button onClick={() => setShowSettings(false)} className="text-gray-700 text-[10px] font-mono">✕</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(true)}
            className="text-gray-700 hover:text-gray-400 transition-colors">
            <Settings2 size={11} />
          </button>
          {status === "disconnected" || status === "error" ? (
            <button onClick={connect}
              className="px-2 py-0.5 rounded text-[10px] font-mono text-blue-400 border border-blue-900 hover:border-blue-600 transition-all">
              CONNECT
            </button>
          ) : (
            <button onClick={disconnect}
              className="px-2 py-0.5 rounded text-[10px] font-mono text-gray-600 border border-gray-800 hover:border-gray-600 transition-all">
              DISCONNECT
            </button>
          )}
        </div>
      )}
    </div>
  );
}