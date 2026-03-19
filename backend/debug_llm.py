import os
import sys
from dotenv import load_dotenv

# Add the current directory to sys.path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.llm_router import LLMRouter

def test_llm_failover():
    load_dotenv()
    print("Testing LLM Router...")
    router = LLMRouter()
    llm = router.get_router()
    
    print(f"Primary LLM: {llm.all_llms[0].model if llm.all_llms else 'None'}")
    print(f"Total providers: {len(llm.all_llms)}")
    
    test_prompt = "Hello, respond with exactly one word: 'Success'."
    print(f"Calling LLM with prompt: {test_prompt}")
    
    try:
        response = llm.call(test_prompt)
        print(f"LLM Response: {response}")
    except Exception as e:
        print(f"Error calling LLM: {e}")

def test_language_support(language="Hindi"):
    load_dotenv()
    print(f"\nTesting Language Support for: {language}")
    router = LLMRouter()
    llm = router.get_router()
    
    # Simulate TradingAgents goal injection
    goal = f"Respond to 'How are you?' in {language} only."
    print(f"Calling LLM with goal: {goal}")
    
    try:
        response = llm.call(goal)
        print(f"LLM Response ({language}): {response}")
    except Exception as e:
        print(f"Error calling LLM for language: {e}")

if __name__ == "__main__":
    test_llm_failover()
    test_language_support("Hindi")
    test_language_support("Gujarati")
