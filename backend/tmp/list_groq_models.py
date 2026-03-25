import os
import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

def list_groq_models():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("No GROQ_API_KEY found")
        return
    
    url = "https://api.groq.com/openai/v1/models"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            models = response.json().get("data", [])
            print("Available Groq Models:")
            for m in models:
                print(f"- {m['id']}")
        else:
            print(f"Failed to list models: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_groq_models()
