import sys
import os
sys.path.append(os.getcwd())

def test_import(module_name):
    print(f"Importing {module_name}...")
    try:
        __import__(module_name)
        print(f"Imported {module_name} successfully")
    except Exception as e:
        print(f"Failed to import {module_name}: {e}")

test_import("app.agents.trading_agents")
test_import("app.crew.tasks")
test_import("app.services.market_service")
test_import("app.services.signal_service")
test_import("app.services.db_service")
test_import("app.core.response_normalizer")
print("All sub-imports tested")
