class LocalChatBridge {
  constructor() {
    this.status = "disconnected";
    this.port = parseInt(localStorage.getItem("said_local_port") || "5056", 10);
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

  async connect(port) {
    if (port) {
      this.port = port;
      localStorage.setItem("said_local_port", String(port));
    }

    this._setStatus("connecting");

    try {
      const res = await fetch(`http://localhost:${this.port}/test`, {
        method: "GET",
      });
      if (res.ok) {
        this._setStatus("connected");
      } else {
        this._setStatus("error");
        this.onError?.("Bridge responded with status: " + res.status);
      }
    } catch (err) {
      this._setStatus("error");
      this.onError?.(err.message);
    }
  }

  async send(text, history) {
    this._setStatus("connected");
    try {
      const res = await fetch(`http://localhost:${this.port}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.slice(-12).map(m => ({ role: m.role, content: m.text || "" })),
        }),
      });

      const data = await res.json();
      const content = data.reply || data.content || data.message || JSON.stringify(data);
      this.onMessage?.({ content });
      this.onDone?.();
    } catch (err) {
      this._setStatus("error");
      this.onError?.(err.message);
    }
  }

  disconnect() {
    this._setStatus("disconnected");
  }

  isConnected() {
    return this.status === "connected";
  }
}

export const localChatBridge = new LocalChatBridge();
