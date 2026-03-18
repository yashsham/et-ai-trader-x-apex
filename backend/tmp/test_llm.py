import os
import sys

# Add current directory to path so imports work
sys.path.append(os.getcwd())

try:
    from app.agents.trading_agents import _get_llm
    print("--- Initializing LLM ---")
    llm = _get_llm()
    
    print("\n--- Testing Inference ---")
    # Test with a simple prompt
    test_prompt = "Say 'Hello, ET AI Trader X is ready!' if you can read this."
    response = llm.invoke(test_prompt)
    
    # Handle different response types (AIMessage vs string)
    content = getattr(response, 'content', str(response))
    
    print(f"LLM Response: {content}")
    print("\nLLM Test Successful!")
    
except Exception as e:
    print(f"\nLLM Test Failed!")
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
