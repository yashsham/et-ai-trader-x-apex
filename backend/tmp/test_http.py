import httpx
import json

def fetch_chart():
    # Use httpx for a clean async/sync HTTP request to the backend
    try:
        response = httpx.get("http://127.0.0.1:8000/api/v1/charts/RELIANCE.NS", params={"period": "1mo"}, timeout=60.0)
        data = response.json()
        print(json.dumps(data.get("data", {}).get("analysis", {}), indent=2))
    except Exception as e:
        print(f"Error fetching chart: {e}")

if __name__ == "__main__":
    fetch_chart()
