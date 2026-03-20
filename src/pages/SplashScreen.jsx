import { useEffect, useState } from "react";

const LOGO = "https://media.base44.com/images/public/user_69af5468cf5d5a8b668927e7/aa22ee38d_ueiiblue.png";

const STATUS_MSGS = [
  "INITIALIZING CORE SYSTEMS...",
  "LOADING NEURAL ARCHITECTURE...",
  "CALIBRATING IDENTITY MATRIX...",
  "MOUNTING SANDBOX ENVIRONMENT...",
  "ESTABLISHING TERMINAL ACCESS...",
  "ALL SYSTEMS NOMINAL.",
  "S.A.I.D. ONLINE.",
];

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    setTimeout(() => setPhase(1), 300);
    setTimeout(() => setPhase(2), 900);

    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 3.5 + 0.5;
      if (p > 100) p = 100;
      setProgress(Math.floor(p));
      setStatusIdx(Math.floor((p / 100) * (STATUS_MSGS.length - 1)));
      if (p >= 100) { clearInterval(iv); setTimeout(onComplete, 700); }
    }, 45);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "radial-gradient(ellipse at center, #080818 0%, #050508 70%)", zIndex: 9999 }}>

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-0.5 opacity-20"
          style={{ background: "linear-gradient(transparent,rgba(59,130,246,0.8),transparent)", animation: "scan-line 3.5s linear infinite", top: 0 }} />
      </div>

      {/* Corner brackets */}
      {[
        "top-5 left-5 border-t-2 border-l-2",
        "top-5 right-5 border-t-2 border-r-2",
        "bottom-5 left-5 border-b-2 border-l-2",
        "bottom-5 right-5 border-b-2 border-r-2",
      ].map((cls, i) => (
        <div key={i} className={`absolute w-8 h-8 border-blue-600 opacity-30 ${cls}`} style={{ borderRadius: "2px" }} />
      ))}

      {/* Logo */}
      <div className={`transition-all duration-1000 ${phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
        <div className="animate-pulse-glow rounded-2xl">
          <img src={LOGO} alt="MYM Logic LLC" className="w-44 h-44 object-contain"
            style={{ filter: "drop-shadow(0 0 40px rgba(59,130,246,0.9))" }} />
        </div>
      </div>

      {/* Title */}
      <div className={`mt-8 text-center transition-all duration-700 ${phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <h1 className="said-title text-6xl font-black text-white text-glow tracking-widest">S.A.I.D.</h1>
        <p className="text-blue-400 text-xs font-mono tracking-widest mt-3" style={{ letterSpacing: "0.22em" }}>
          STRATEGIZED · ANALYZED · IMPROVISED · DESIGNS
        </p>
        <p className="text-blue-800 text-xs font-mono tracking-widest mt-1">MYM LOGIC LLC</p>
      </div>

      {/* Progress */}
      <div className={`mt-14 w-96 transition-all duration-700 delay-300 ${phase >= 2 ? "opacity-100" : "opacity-0"}`}>
        <div className="flex justify-between text-xs font-mono text-blue-600 mb-2">
          <span>{STATUS_MSGS[statusIdx]}</span>
          <span className="text-blue-400">{progress}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "#0d0d1a" }}>
          <div className="h-full rounded-full transition-all duration-75"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)", boxShadow: "0 0 12px rgba(59,130,246,0.7)" }} />
        </div>
        <div className="flex justify-between mt-2">
          {[0,25,50,75,100].map(v => (
            <div key={v} className="w-1.5 h-1.5 rounded-full transition-colors"
              style={{ background: progress >= v ? "#3b82f6" : "#1a1a2e" }} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 text-blue-900 text-xs font-mono tracking-widest">
        v1.0.0 — SYNTHETIC ADAPTIVE INTELLIGENCE DESIGNER
      </div>
    </div>
  );
}