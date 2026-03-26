import json
import os
from aiohttp import web, ClientSession, ClientTimeout

PORT = int(os.getenv("SAID_PORT", 5055))
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:12b")

async def chat_completions(request):
    try:
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
                }, headers={"Access-Control-Allow-Origin": "*"})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500,
                                  headers={"Access-Control-Allow-Origin": "*"})

async def preflight(request):
    return web.Response(headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    })

async def health(request):
    return web.json_response({"ok": True, "model": OLLAMA_MODEL})

app = web.Application()
app.router.add_post("/chat/completions", chat_completions)
app.router.add_post("/v1/chat/completions", chat_completions)
app.router.add_route("OPTIONS", "/chat/completions", preflight)
app.router.add_route("OPTIONS", "/v1/chat/completions", preflight)
app.router.add_get("/health", health)

if __name__ == "__main__":
    print(f"[rest-bridge] starting on http://127.0.0.1:{PORT}")
    print(f"[rest-bridge] ollama: {OLLAMA_BASE_URL} model={OLLAMA_MODEL}")
    web.run_app(app, host="127.0.0.1", port=PORT)
