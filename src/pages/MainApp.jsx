import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ChatPanel from "../components/ChatPanel";
import SandboxPanel from "../components/SandboxPanel";
import TerminalPanel from "../components/TerminalPanel";
import GeneratePanel from "../components/GeneratePanel";
import FilesPanel from "../components/FilesPanel";
import MemoryPanel from "../components/MemoryPanel";
import IdentityPanel from "../components/IdentityPanel";
import AppEditorPanel from "../components/AppEditorPanel";

const PANELS = {
  chat: ChatPanel,
  sandbox: SandboxPanel,
  terminal: TerminalPanel,
  generate: GeneratePanel,
  files: FilesPanel,
  memory: MemoryPanel,
  identity: IdentityPanel,
  editor: AppEditorPanel,
};

export default function MainApp() {
  const [activePanel, setActivePanel] = useState("chat");
  const Panel = PANELS[activePanel] || ChatPanel;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#050508" }}>
      <Sidebar active={activePanel} onSelect={setActivePanel} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar panel={activePanel} />
        <div className="flex-1 overflow-hidden">
          <Panel />
        </div>
      </div>
    </div>
  );
}