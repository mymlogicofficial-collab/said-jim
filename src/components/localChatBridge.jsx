import { io } from "socket.io-client";

class LocalChatBridge {
  constructor() {
    this.socket = null;
    this.status = "disconnected";
    this.port = parseInt(localStorage.getItem("said_local_port") || "5000", 10);
    this.onStatusChange = null;
    this.onMessage = null;
    this.onToken = null;
    this.onDone = null;
    this.onError = null;
  }

  _setStatus(s) {
    this.status = s;
    this.onStatusChange?.(s);
  }

  connect(port) {
    if (port) {
      this.port = port;
      localStorage.setItem("said_local_port", String(port));
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this._setStatus("connecting");

    this.socket = io(`http://localhost:${this.port}`, {
      transports: ["websocket"],
      reconnection: false,
      timeout: 5000,
    });

    this.socket.on("connect", () => this._setStatus("connected"));

    this.socket.on("connect_error", (err) => {
      this._setStatus("error");
      this.onError?.(err.message);
    });

    this.socket.on("disconnect", () => this._setStatus("disconnected"));

    // L.I.V.E engine response events
    this.socket.on("response", (data) => {
      const content = typeof data === "string" ? data : data?.data || data?.content || JSON.stringify(data);
      this.onMessage?.({ content });
    });

    this.socket.on("token", (data) => {
      const token = typeof data === "string" ? data : data?.content || data?.token || "";
      this.onToken?.(token);
    });

    this.socket.on("done", () => {
      this.onDone?.();
    });
  }

  send(text, history) {
    if (!this.socket?.connected) return;
    this.socket.emit("message", {
      message: text,
      history: history.slice(-12).map(m => ({ role: m.role, content: m.text || "" })),
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this._setStatus("disconnected");
  }

  isConnected() {
    return this.socket?.connected === true;
  }
}

export const localChatBridge = new LocalChatBridge();