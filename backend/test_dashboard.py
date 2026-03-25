import asyncio
import os
import sys

# Set up path so we can import app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.dashboard_service import dashboard_service

def run_test():
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("Testing get_dashboard_summary...")
        # Since it's synchronous:
        res = dashboard_service.get_dashboard_summary("English")
        print("Result:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
