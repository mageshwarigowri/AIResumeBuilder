import json
import os
from pathlib import Path
import requests
from django.conf import settings
from django.http import FileResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

def health(request):
    return JsonResponse({"status":"ok","aiConfigured":bool(os.getenv("GROQ_API_KEY"))})

def _list(value):
    if isinstance(value,list):
        return [str(x).strip() for x in value if str(x).strip()]
    return [x.strip() for x in str(value or "").split(",") if x.strip()]

def _fallback(data):
    role = data.get("targetRole") or "professional"
    skills = _list(data.get("skills"))
    jobs = []
    for job in data.get("experience",[]):
        description = str(job.get("description","")).strip()
        bullets = [line.strip(" -") for line in description.splitlines() if line.strip()]
        if not bullets and description:
            bullets = [description]
        jobs.append({**job,"bullets":bullets[:5]})
    skill_text = ", ".join(skills[:4]) if skills else "cross-functional collaboration"
    return {**data,
        "summary":f"Results-focused {role} with hands-on experience in {skill_text}. Known for translating complex challenges into clear, reliable outcomes and collaborating effectively across teams.",
        "skills":skills,"experience":jobs,"aiMode":"smart-fallback"}

def _groq(data):
    prompt = """You are an expert resume writer. Improve the supplied resume for the target role.
Return ONLY valid JSON shaped as:
{"summary":"3 concise sentences","skills":["skill"],"experience":[{"company":"","role":"","startDate":"","endDate":"","bullets":["achievement-focused bullet"]}],"education":[{"school":"","degree":"","year":""}]}
Never invent employers, dates, degrees, metrics, or qualifications. Preserve every fact. Rewrite experience as 2-5 crisp action-led bullets. Prioritize relevant ATS keywords naturally.
INPUT: """ + json.dumps(data)
    response = requests.post("https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization":f"Bearer {os.environ['GROQ_API_KEY']}","Content-Type":"application/json"},
        json={"model":os.getenv("GROQ_MODEL","llama-3.1-8b-instant"),"messages":[{"role":"user","content":prompt}],"temperature":0.35,"response_format":{"type":"json_object"}},timeout=30)
    response.raise_for_status()
    text = response.json()["choices"][0]["message"]["content"].strip()
    if text.startswith(chr(96) * 3):
        text = text.split("\n",1)[1].rsplit(chr(96) * 3,1)[0]
    return {**data,**json.loads(text),"aiMode":"groq"}

@csrf_exempt
@require_http_methods(["POST"])
def generate_resume(request):
    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error":"Please send valid JSON."},status=400)
    missing = [x for x in ["fullName","email","targetRole"] if not str(data.get(x,"")).strip()]
    if missing:
        return JsonResponse({"error":f"Missing required fields: {', '.join(missing)}"},status=400)
    try:
        result = _groq(data) if os.getenv("GROQ_API_KEY") else _fallback(data)
    except (requests.RequestException,KeyError,ValueError,json.JSONDecodeError):
        result = _fallback(data)
        result["aiMode"] = "fallback-after-ai-error"
    return JsonResponse({"resume":result})

def frontend(request):
    index = Path(settings.BASE_DIR) / "frontend_dist" / "index.html"
    if not index.exists():
        return JsonResponse({"message":"React app is not built. Run npm run dev."},status=503)
    return FileResponse(index.open("rb"),content_type="text/html")
