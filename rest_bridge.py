from aiohttp import web
import aiohttp_cors
import json
import os
from aiohttp import ClientSession, ClientTimeout

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:12b")

app = web.Application()

cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
        allow_credentials=True,
        expose_headers="*",
        allow_headers="*",
        allow_methods=["GET", "POST", "OPTIONS"],
    )
})

async def handle_health(request):
    return web.json_response({"status": "ok", "model": OLLAMA_MODEL})

async def handle_chat_simple(request):
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
            return web.json_response({"reply": content})

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
            })

health_resource = cors.add(app.router.add_resource("/health"))
cors.add(health_resource.add_route("GET", handle_health))

chat_resource = cors.add(app.router.add_resource("/chat"))
cors.add(chat_resource.add_route("POST", handle_chat_simple))

completions_resource = cors.add(app.router.add_resource("/chat/completions"))
cors.add(completions_resource.add_route("POST", handle_chat_completions))

web.run_app(app, port=5056)
