import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(".env")

def check_groq():
    key = os.getenv("GROQ_API_KEY")
    if not key: return "MISSING KEY"
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": "HI"}], "max_tokens": 5}
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return resp.status_code, resp.text
    except Exception as e:
        return str(e)

def check_gemini():
    key = os.getenv("GEMINI_API_KEY")
    if not key: return "MISSING KEY"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={key}"
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts":[{"text": "HI"}]}]}
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return resp.status_code, resp.text
    except Exception as e:
        return str(e)

print("--- GROQ DIAGNOSTIC ---")
print(check_groq())
print("\n--- GEMINI DIAGNOSTIC ---")
print(check_gemini())
