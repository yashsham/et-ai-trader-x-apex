import os
import sys
sys.path.insert(0, 'd:/ETPROJECT/et-ai-trader-x-apex/backend')
os.environ.setdefault("PYTHONPATH", "d:/ETPROJECT/et-ai-trader-x-apex/backend")

from dotenv import load_dotenv
load_dotenv("d:/ETPROJECT/et-ai-trader-x-apex/backend/.env")

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

gemini_key = os.environ.get("GEMINI_API_KEY")
print(f"Using Gemini Key: {gemini_key[:8]}..." if gemini_key else "NO GEMINI KEY FOUND!")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=gemini_key,
    temperature=0.1
)

print("Testing Gemini LLM directly...")
response = llm.invoke([HumanMessage(content="You are a stock analyst. Briefly analyze RSI of 67 for RELIANCE.NS in one sentence.")])
print(f"[SUCCESS] Gemini responded: {response.content}")
