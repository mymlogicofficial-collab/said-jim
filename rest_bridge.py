from aiohttp import web
import aiohttp_cors
import json
import os
from aiohttp import ClientSession, ClientTimeout

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:12b")

app = web.Application()

# Enable CORS
cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
        allow_credentials=True,
        expose_headers="*",
        allow_headers="*",
    )
})

# Chat route
async def handle_chat(request):
    data = await request.json()
    messages = data.get("messages", [])
    model = data.get("model", OLLAMA_MODEL)

    url = f"{OLLAMA_BASE_URL.rstrip('/')}/api/chat"
    payload = {"model": model, "messages": messages, "stream": False}

    timeout = ClientTimeout(total=120)
    async with ClientSession(timeout=timeout) as session:
        async with session.post(url, json=payload) as resp:
            result = await resp.json()
            content = result.get("message", {}).get("content", "")
            return web.json_response({
                "choices": [{"message": {"role": "assistant", "content": content}}]
            })

resource = cors.add(app.router.add_resource("/chat/completions"))
cors.add(resource.add_route("POST", handle_chat))

web.run_app(app, port=5056)
