import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

const devUrl = process.env.ELECTRON_RENDERER_URL ?? "http://localhost:5173/";
const viteHost = process.env.VITE_HOST ?? "127.0.0.1";
const vitePort = process.env.VITE_PORT ?? "5173";

function spawnCommand(command, args, options = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    cwd: projectRoot,
    env: process.env,
    ...options,
  });
}

async function isDevServerUp(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForDevServer(url, { timeoutMs = 60000, intervalMs = 1000 } = {}) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await isDevServerUp(url)) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

const main = async () => {
  let viteProc = null;
  const serverUp = await isDevServerUp(devUrl);

  if (!serverUp) {
    // Start Vite dev server.
    viteProc = spawnCommand("npm", ["run", "dev", "--", "--host", viteHost, "--port", vitePort]);

    const ok = await waitForDevServer(devUrl);
    if (!ok) {
      viteProc?.kill();
      console.error(`Electron: Vite dev server did not start at ${devUrl}`);
      process.exit(1);
    }
  }

  // Start Electron pointing at our main process file.
  const electronEntry = path.join(projectRoot, "electron", "main.js");
  const electronExe = path.join(projectRoot, "node_modules", "electron", "dist", "electron.exe");

  const electronProc =
    process.platform === "win32"
      ? spawn(electronExe, [electronEntry], {
          stdio: "inherit",
          cwd: projectRoot,
          env: { ...process.env, ELECTRON_RENDERER_URL: devUrl },
        })
      : spawn("electron", [electronEntry], {
          stdio: "inherit",
          cwd: projectRoot,
          env: { ...process.env, ELECTRON_RENDERER_URL: devUrl },
        });

  electronProc.on("exit", (code) => {
    if (viteProc) viteProc.kill();
    process.exit(code ?? 0);
  });
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

