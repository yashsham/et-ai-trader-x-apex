
import json
from fastapi.testclient import TestClient
from app.main import app

def test_analyze_stock():
    client = TestClient(app)
    payload = {
        "symbol": "RELIANCE.NS",
        "portfolio": {},
        "language": "Hindi"
    }
    print(f"Testing /api/v1/analyze-stock with payload: {payload}")
    try:
        response = client.post("/api/v1/analyze-stock", json=payload)
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"FAILED with exception: {e}")

if __name__ == "__main__":
    test_analyze_stock()
