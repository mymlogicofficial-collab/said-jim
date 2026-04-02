import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const DEFAULT_PORT = 5056;

const MAX_HISTORY_LENGTH = 12;

/**
 * useSAIDSocket – React hook for connecting to the chatron-voice-link Socket.IO bridge.
 *
 * Bridge protocol (port 5056 by default):
 *   Emit : "user_message"  { message: string, history: [{role, content}] }
 *   On   : "token"         streamed partial response
 *   On   : "done"          response complete
 *   On   : "bot_message"   full response (some bridge versions)
 *
 * Usage:
 *   const { status, sendMessage, streamBuffer } = useSAIDSocket({ port: 5055 });
 */
export function useSAIDSocket({ port: initialPort } = {}) {
  const [status, setStatus] = useState("disconnected"); // disconnected | connecting | connected | error
  const [streamBuffer, setStreamBuffer] = useState("");

  const socketRef = useRef(null);
  const portRef = useRef(
    initialPort ||
    parseInt(localStorage.getItem("said_local_port") || String(DEFAULT_PORT), 10)
  );

  const onTokenRef = useRef(null);
  const onDoneRef = useRef(null);
  const onErrorRef = useRef(null);

  const connect = useCallback((port) => {
    if (port) {
      portRef.current = port;
      localStorage.setItem("said_local_port", String(port));
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setStatus("connecting");

    const socket = io(`http://localhost:${portRef.current}`, {
      transports: ["websocket"],
      reconnection: false,
      timeout: 5000,
    });

    socket.on("connect", () => setStatus("connected"));
    socket.on("disconnect", () => setStatus("disconnected"));
    socket.on("connect_error", () => setStatus("error"));

    socket.on("token", (data) => {
      const token = typeof data === "string" ? data : data?.content || data?.token || "";
      onTokenRef.current?.(token);
    });

    socket.on("done", () => {
      onDoneRef.current?.();
    });

    // Some bridge versions send full message at once
    socket.on("bot_message", (data) => {
      const content = typeof data === "string" ? data : data?.content || data?.message || "";
      onDoneRef.current?.(content);
    });

    socket.on("error", (msg) => {
      const errMsg = typeof msg === "string" ? msg : msg?.message || "Bridge error";
      onErrorRef.current?.(errMsg);
    });

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setStatus("disconnected");
  }, []);

  const isConnected = useCallback(() => socketRef.current?.connected === true, []);

  /**
   * Send a message to the bridge and stream the response.
   * Returns a Promise that resolves with the full response string.
   */
  const sendMessage = useCallback((text, history = []) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error("Not connected to local bridge"));
        return;
      }

      let full = "";
      setStreamBuffer("");

      const handleToken = (token) => {
        full += token;
        setStreamBuffer(full);
      };

      const handleDone = (content) => {
        if (content) full = content;
        setStreamBuffer("");
        cleanup();
        resolve(full);
      };

      const handleError = (msg) => {
        cleanup();
        setStreamBuffer("");
        reject(new Error(msg));
      };

      const cleanup = () => {
        onTokenRef.current = null;
        onDoneRef.current = null;
        onErrorRef.current = null;
      };

      onTokenRef.current = handleToken;
      onDoneRef.current = handleDone;
      onErrorRef.current = handleError;

      socketRef.current.emit("user_message", {
        message: text,
        history: history.slice(-MAX_HISTORY_LENGTH).map((m) => ({
          role: m.role,
          content: m.text || m.content || "",
        })),
      });
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return {
    status,
    streamBuffer,
    connect,
    disconnect,
    isConnected,
    sendMessage,
    port: portRef.current,
  };
}
