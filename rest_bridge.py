from aiohttp import web
import os
from aiohttp import ClientSession, ClientTimeout

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:12b")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, bypass-tunnel-reminder, ngrok-skip-browser-warning",
}

app = web.Application()

async def handle_options(request):
    return web.Response(status=200, headers=CORS_HEADERS)

async def handle_health(request):
    return web.json_response({"status": "ok", "model": OLLAMA_MODEL}, headers=CORS_HEADERS)

async def handle_chat(request):
    data = await request.json()
    message = data.get("message", "")
    history = data.get("history", [])
    messages = history + [{"role": "user", "content": message}]
    url = OLLAMA_BASE_URL.rstrip("/") + "/api/chat"
    payload = {"model": OLLAMA_MODEL, "messages": messages, "stream": False}
    timeout = ClientTimeout(total=120)
    async with ClientSession(timeout=timeout) as session:
        async with session.post(url, json=payload) as resp:
            result = await resp.json()
            content = result.get("message", {}).get("content", "")
            return web.json_response({"reply": content}, headers=CORS_HEADERS)

async def handle_chat_completions(request):
    data = await request.json()
    messages = data.get("messages", [])
    model = data.get("model", OLLAMA_MODEL)
    url = OLLAMA_BASE_URL.rstrip("/") + "/api/chat"
    payload = {"model": model, "messages": messages, "stream": False}
    timeout = ClientTimeout(total=120)
    async with ClientSession(timeout=timeout) as session:
        async with session.post(url, json=payload) as resp:
            result = await resp.json()
            content = result.get("message", {}).get("content", "")
            return web.json_response({
                "choices": [{"message": {"role": "assistant", "content": content}}]
            }, headers=CORS_HEADERS)

app.router.add_route("OPTIONS", "/health", handle_options)
app.router.add_route("GET", "/health", handle_health)
app.router.add_route("OPTIONS", "/chat", handle_options)
app.router.add_route("POST", "/chat", handle_chat)
app.router.add_route("OPTIONS", "/chat/completions", handle_options)
app.router.add_route("POST", "/chat/completions", handle_chat_completions)

web.run_app(app, port=5056)
