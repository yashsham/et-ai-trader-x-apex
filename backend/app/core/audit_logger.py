"""
Audit Logger — adapted from yash-genai-prod-os (ConsoleJSONLogger pattern).
Logs security events as structured JSON to stdout for easy monitoring.
"""
import json
import time
from typing import Dict, Any


class AuditLogger:
    def log_event(self, event_type: str, severity: str, details: Dict[str, Any], user_id: str = "anonymous"):
        entry = {
            "timestamp": time.time(),
            "event_type": event_type,
            "severity": severity,
            "user_id": user_id,
            "details": details
        }
        print(json.dumps(entry))


audit_logger = AuditLogger()
