import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createMainWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Keep the renderer sandboxed; this app is a Vite SPA.
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const devUrl = process.env.ELECTRON_RENDERER_URL ?? "http://localhost:5173/";
  const distIndex = path.join(__dirname, "..", "dist", "index.html");

  // Prefer the running Vite dev server if it responds.
  try {
    const res = await fetch(devUrl, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      win.loadURL(devUrl);
      return;
    }
  } catch {
    // Fall back to the built file.
  }

  win.loadFile(distIndex);
}

app.whenReady().then(() => {
  createMainWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

