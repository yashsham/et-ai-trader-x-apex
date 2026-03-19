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

test_import("app.core.config")
test_import("app.models.responses")
test_import("app.crew.orchestrator")
test_import("app.core.audit_logger")
test_import("app.core.injection_scanner")
test_import("app.services.db_service")
test_import("app.services.dashboard_service")
test_import("app.services.radar_service")
test_import("app.services.portfolio_service")
test_import("app.services.chat_service")
test_import("app.services.news_service")
print("All imports tested")
