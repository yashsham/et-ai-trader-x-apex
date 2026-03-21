import os
import requests
import json
from dotenv import load_dotenv

def test_openrouter_functionality():
    # Load Environment
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dotenv_path = os.path.join(script_dir, "../.env")
    load_dotenv(dotenv_path=dotenv_path)
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("[ERROR] OPENROUTER_API_KEY not found.")
        return

    print("--- OpenRouter: Functional Test after Privacy Fix ---")
    
    models_to_test = [
        "openai/gpt-oss-120b:free",
        "openai/gpt-oss-20b:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemma-3-27b-it:free"
    ]
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://et-ai-trader.com",
        "X-Title": "ET AI Trader Test"
    }

    for model_name in models_to_test:
        print(f"\n[ATTEMPTING] {model_name}")
        try:
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "user", "content": "Hello! Confirm your name and provide a 1-sentence market greeting."}
                ]
            }
            
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                data=json.dumps(payload),
                timeout=45
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content'].strip()
                print(f"[SUCCESS] {content}")
            else:
                print(f"[FAILED] ({response.status_code}): {response.text}")
                
        except Exception as e:
            print(f"[ERROR] {e}")

if __name__ == "__main__":
    test_openrouter_functionality()
