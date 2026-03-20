import { useState, useRef } from "react";
import { Upload, File, Image, Music, Video, FileText, Archive, X, Eye } from "lucide-react";

function getIcon(type) {
  if (type.startsWith("image")) return Image;
  if (type.startsWith("audio")) return Music;
  if (type.startsWith("video")) return Video;
  if (type.includes("zip") || type.includes("archive")) return Archive;
  return FileText;
}

export default function FilesPanel() {
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const processFiles = (fileList) => {
    Array.from(fileList).forEach(file => {
      const url = URL.createObjectURL(file);
      setFiles(prev => [...prev, { id: Date.now() + Math.random(), name: file.name, size: (file.size / 1024).toFixed(1) + " KB", type: file.type || "unknown", url, rawFile: file }]);
    });
  };

  return (
    <div className="flex h-full">
      {/* Left: list */}
      <div className="flex flex-col w-64 flex-shrink-0" style={{ borderRight: "1px solid #1a1a2e" }}>
        <div
          onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileRef.current?.click()}
          className="m-3 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all flex-shrink-0"
          style={{ height: 120, border: `2px dashed ${dragging ? "#3b82f6" : "#1e3a5f"}`, background: dragging ? "rgba(59,130,246,.08)" : "rgba(29,78,216,.03)" }}>
          <Upload size={20} className={dragging ? "text-blue-400" : "text-blue-800"} />
          <p className="text-xs font-mono text-gray-600 text-center">Drop files or click<br/>All types accepted</p>
        </div>
        <input ref={fileRef} type="file" multiple accept="*/*" className="hidden"
          onChange={e => { processFiles(e.target.files); e.target.value = ""; }} />

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {files.length === 0
            ? <p className="text-center text-gray-700 text-xs font-mono mt-6">No files</p>
            : files.map(f => {
              const Icon = getIcon(f.type);
              return (
                <div key={f.id} onClick={() => setPreview(f)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer mb-1 transition-all"
                  style={{ background: preview?.id === f.id ? "rgba(59,130,246,.12)" : "transparent", border: `1px solid ${preview?.id === f.id ? "#1e3a5f" : "transparent"}` }}>
                  <Icon size={13} className="text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-300 truncate">{f.name}</p>
                    <p className="text-xs text-gray-700">{f.size}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFiles(fs => fs.filter(x => x.id !== f.id)); if (preview?.id === f.id) setPreview(null); }}
                    className="text-gray-700 hover:text-red-500 transition-colors"><X size={11} /></button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Right: preview */}
      <div className="flex-1 flex flex-col">
        {preview ? (
          <>
            <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
              style={{ borderBottom: "1px solid #1a1a2e", background: "#080812" }}>
              <span className="text-xs font-mono text-gray-400 truncate">{preview.name}</span>
              <button onClick={() => setPreview(null)} className="text-gray-600 hover:text-gray-300 ml-2"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
              {preview.type.startsWith("image") && (
                <img src={preview.url} alt={preview.name} className="max-w-full max-h-full rounded-lg object-contain" />
              )}
              {preview.type.startsWith("audio") && (
                <div className="w-full mt-8"><audio controls className="w-full"><source src={preview.url} /></audio></div>
              )}
              {preview.type.startsWith("video") && (
                <video controls className="max-w-full rounded-lg" style={{ maxHeight: "70vh" }}><source src={preview.url} /></video>
              )}
              {!preview.type.startsWith("image") && !preview.type.startsWith("audio") && !preview.type.startsWith("video") && (
                <div className="text-center mt-16">
                  <File size={48} className="text-blue-800 mx-auto mb-4" />
                  <p className="text-gray-500 font-mono text-sm">{preview.name}</p>
                  <p className="text-gray-700 text-xs mt-1">{preview.size}</p>
                  <a href={preview.url} download={preview.name}
                    className="inline-block mt-4 px-4 py-2 rounded text-xs font-mono text-blue-400 border border-blue-900 hover:border-blue-600">
                    DOWNLOAD
                  </a>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-20">
            <div className="text-center">
              <Eye size={40} className="text-blue-900 mx-auto mb-3" />
              <p className="text-gray-600 text-sm font-mono">Select a file to preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}