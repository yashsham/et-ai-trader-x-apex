
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoint(path, name):
    print(f"\n--- Testing {name} ---")
    try:
        response = requests.get(f"{BASE_URL}{path}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2)[:1000] + "...")
        else:
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_endpoint("/market/sentiment", "Market Sentiment")
    test_endpoint("/market/movers", "Live Movers")
    test_endpoint("/history/recent", "Live AI Alerts")
