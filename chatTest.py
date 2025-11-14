# ollama_web 연습용 예제입니다.
from flask import Flask, request, jsonify, Response, stream_with_context, render_template
import requests

OLLAMA_URL = "http://host.docker.internal:11434/api/generate"
app = Flask(__name__)

@app.get("/")
def index():
    return render_template("index2.html")

@app.post("/api/generate")
def generate_stream():
    body = request.get_json(force=True, silent=True) or {}
    model = body.get("model", "gemma:3.4b")
    prompt = body.get("prompt", "")
    stream = True # 이 엔드포인트는 강제 스트리밍
    upstream = requests.post(
        OLLAMA_URL,
        json={"model": model, "prompt": prompt, "stream": stream},
        stream=True,
        timeout=600,
        )
    def gen():
        for line in upstream.iter_lines():
            if not line:
                continue
            yield line + b"\n"
    return Response(stream_with_context(gen()), mimetype="application/x-ndjson")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)