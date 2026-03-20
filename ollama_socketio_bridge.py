import os
import json
import asyncio
import argparse
from aiohttp import web, ClientSession, ClientTimeout
import socketio


def _env_int(name: str, default: int) -> int:
    v = os.getenv(name)
    if not v:
        return default
    try:
        return int(v)
    except ValueError:
        return default


SAID_PORT = _env_int("SAID_PORT", 5000)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:12b")

sio = socketio.AsyncServer(async_mode="aiohttp", cors_allowed_origins="*")
app = web.Application()
sio.attach(app)


def _to_ollama_messages(history, user_text: str):
    messages = []
    if isinstance(history, list):
        for m in history:
            if not isinstance(m, dict):
                continue
            role = m.get("role")
            content = m.get("content")
            if role in ("user", "assistant", "system") and isinstance(content, str) and content.strip():
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_text})
    return messages


async def _ollama_stream_chat(messages, *, model: str):
    url = f"{OLLAMA_BASE_URL.rstrip('/')}/api/chat"
    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
    }

    timeout = ClientTimeout(total=120, sock_connect=10, sock_read=120)
    async with ClientSession(timeout=timeout) as session:
        async with session.post(url, json=payload) as resp:
            resp.raise_for_status()
            async for raw in resp.content:
                line = raw.decode("utf-8", errors="ignore").strip()
                if not line:
                    continue
                try:
                    yield json.loads(line)
                except json.JSONDecodeError:
                    continue


@sio.event
async def connect(sid, environ):
    print(f"[said-bridge] client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"[said-bridge] client disconnected: {sid}")


@sio.on("message")
async def on_message(sid, data):
    try:
        print(f"[said-bridge] message event from {sid}")
        text = data.get("message") if isinstance(data, dict) else None
        history = data.get("history") if isinstance(data, dict) else None

        if not isinstance(text, str) or not text.strip():
            await sio.emit("response", {"content": ""}, to=sid)
            await sio.emit("done", {}, to=sid)
            return

        messages = _to_ollama_messages(history, text)
        print(f"[said-bridge] -> ollama model={OLLAMA_MODEL} chars={len(text)} history={len(history) if isinstance(history, list) else 0}")

        full = ""
        async for chunk in _ollama_stream_chat(messages, model=OLLAMA_MODEL):
            msg = chunk.get("message") if isinstance(chunk, dict) else None
            content = msg.get("content") if isinstance(msg, dict) else None
            if isinstance(content, str) and content:
                full += content
                await sio.emit("token", {"token": content}, to=sid)

            if chunk.get("done") is True:
                break

        print(f"[said-bridge] <- done chars={len(full)}")
        await sio.emit("response", {"content": full}, to=sid)
        await sio.emit("done", {}, to=sid)
    except Exception as e:
        print(f"[said-bridge] ERROR: {e}")
        await sio.emit("response", {"content": f"Error: {e}"}, to=sid)
        await sio.emit("done", {}, to=sid)


async def _health(_request):
    return web.json_response({
        "ok": True,
        "port": SAID_PORT,
        "ollama_base_url": OLLAMA_BASE_URL,
        "ollama_model": OLLAMA_MODEL,
    })


app.router.add_get("/health", _health)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(add_help=True)
    parser.add_argument("--port", type=int, default=SAID_PORT)
    parser.add_argument("--ollama", dest="ollama_base_url", default=OLLAMA_BASE_URL)
    parser.add_argument("--model", default=OLLAMA_MODEL)
    args = parser.parse_args()

    SAID_PORT = args.port
    OLLAMA_BASE_URL = args.ollama_base_url
    OLLAMA_MODEL = args.model

    print(f"[said-bridge] starting Socket.IO bridge on http://127.0.0.1:{SAID_PORT}")
    print(f"[said-bridge] ollama: {OLLAMA_BASE_URL} model={OLLAMA_MODEL}")
    web.run_app(app, host="127.0.0.1", port=SAID_PORT)
