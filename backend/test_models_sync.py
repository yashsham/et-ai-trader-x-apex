import time
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# Force UTF-8 for Windows
import sys
import io
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv(dotenv_path="backend/.env")

def test_gemini(model_name):
    key = os.getenv("GEMINI_API_KEY")
    if not key: return f"Gemini {model_name}: SKIPPED (No Key)"
    try:
        llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=key, timeout=5)
        start = time.time()
        res = llm.invoke([HumanMessage(content="Hi")])
        elapsed = time.time() - start
        return f"Gemini {model_name}: SUCCESS ({elapsed:.2f}s)"
    except Exception as e:
        return f"Gemini {model_name}: FAIL - {str(e)[:100]}"

def test_groq(model_name):
    key = os.getenv("GROQ_API_KEY")
    if not key: return f"Groq {model_name}: SKIPPED (No Key)"
    try:
        llm = ChatOpenAI(
            model=model_name,
            api_key=key,
            base_url="https://api.groq.com/openai/v1",
            timeout=5,
            max_retries=0
        )
        start = time.time()
        res = llm.invoke([HumanMessage(content="Hi")])
        elapsed = time.time() - start
        return f"Groq {model_name}: SUCCESS ({elapsed:.2f}s)"
    except Exception as e:
        return f"Groq {model_name}: FAIL - {str(e)[:100]}"

def test_openrouter(model_name):
    key = os.getenv("OPENROUTER_API_KEY")
    if not key: return f"OpenRouter {model_name}: SKIPPED (No Key)"
    try:
        llm = ChatOpenAI(
            model=model_name,
            api_key=key,
            base_url="https://openrouter.ai/api/v1",
            timeout=5,
            max_retries=0
        )
        start = time.time()
        res = llm.invoke([HumanMessage(content="Hi")])
        elapsed = time.time() - start
        return f"OpenRouter {model_name}: SUCCESS ({elapsed:.2f}s)"
    except Exception as e:
        return f"OpenRouter {model_name}: FAIL - {str(e)[:100]}"

if __name__ == "__main__":
    print("--- LLM SYNC DIAGNOSTIC ---")
    
    # Testing Gemini
    print(test_gemini("gemini-2.0-flash"))
    print(test_gemini("gemini-1.5-flash"))
    
    # Testing Groq
    print(test_groq("llama-3.3-70b-versatile"))
    print(test_groq("llama-3.1-70b-versatile"))
    
    # Testing OpenRouter
    print(test_openrouter("openai/gpt-4o-mini"))
    print(test_openrouter("google/gemini-2.0-flash-001"))
