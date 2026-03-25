import asyncio
import time
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

load_dotenv()

async def test_gemini(model_name):
    key = os.getenv("GEMINI_API_KEY")
    if not key: return f"Gemini {model_name}: No Key"
    try:
        llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=key, timeout=5)
        start = time.time()
        res = await llm.ainvoke([HumanMessage(content="Hi")])
        elapsed = time.time() - start
        return f"Gemini {model_name}: SUCCESS ({elapsed:.2f}s)"
    except Exception as e:
        return f"Gemini {model_name}: FAIL - {str(e)[:50]}"

async def test_groq(model_name):
    key = os.getenv("GROQ_API_KEY")
    if not key: return f"Groq {model_name}: No Key"
    try:
        # Use OpenAI driver for Groq
        llm = ChatOpenAI(
            model=model_name,
            api_key=key,
            base_url="https://api.groq.com/openai/v1",
            timeout=5,
            max_retries=0
        )
        start = time.time()
        res = await llm.ainvoke([HumanMessage(content="Hi")])
        elapsed = time.time() - start
        return f"Groq {model_name}: SUCCESS ({elapsed:.2f}s)"
    except Exception as e:
        return f"Groq {model_name}: FAIL - {str(e)[:50]}"

async def test_openrouter(model_name):
    key = os.getenv("OPENROUTER_API_KEY")
    if not key: return f"OpenRouter {model_name}: No Key"
    try:
        llm = ChatOpenAI(
            model=model_name,
            api_key=key,
            base_url="https://openrouter.ai/api/v1",
            timeout=5,
            max_retries=0
        )
        start = time.time()
        res = await llm.ainvoke([HumanMessage(content="Hi")])
        elapsed = time.time() - start
        return f"OpenRouter {model_name}: SUCCESS ({elapsed:.2f}s)"
    except Exception as e:
        return f"OpenRouter {model_name}: FAIL - {str(e)[:50]}"

async def main():
    print("--- LLM AUTO-DIAGNOSTIC ---")
    tasks = [
        test_gemini("gemini-2.0-flash"),
        test_gemini("gemini-1.5-flash"),
        test_groq("llama-3.3-70b-versatile"),
        test_groq("llama-3.1-70b-versatile"),
        test_openrouter("openai/gpt-4o-mini"),
        test_openrouter("google/gemini-flash-1.5")
    ]
    results = await asyncio.gather(*tasks)
    for r in results:
        print(r)

if __name__ == "__main__":
    asyncio.run(main())
