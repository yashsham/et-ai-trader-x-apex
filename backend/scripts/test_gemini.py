import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_gemini_models():
    # Load Environment
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dotenv_path = os.path.join(script_dir, "../.env")
    load_dotenv(dotenv_path=dotenv_path)
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not found in .env file.")
        return

    print(f"--- ET AI Trader: Gemini Future Model Test ---")
    genai.configure(api_key=api_key)

    # Models we want to verify
    models_to_test = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-3.1-pro-preview",
        "gemini-3-flash-preview"
    ]
    
    for model_name in models_to_test:
        print(f"\n🚀 Testing Model: {model_name}")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Hello! Give me a 1-sentence market outlook.")
            print(f"✅ SUCCESS: {response.text.strip()}")
        except Exception as e:
            if "429" in str(e):
                print(f"⚠️ RECOGNIZED but QUOTA EXCEEDED (429): This model is in restricted preview.")
            else:
                print(f"❌ FAILED: {e}")

if __name__ == "__main__":
    test_gemini_models()
