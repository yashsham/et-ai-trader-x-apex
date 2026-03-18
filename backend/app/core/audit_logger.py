"""
Audit Logger — adapted from yash-genai-prod-os (ConsoleJSONLogger pattern).
Logs security events as structured JSON to stdout AND persists to Supabase.
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

        # Persist to Supabase (lazy import to avoid circular deps)
        try:
            from app.services.db_service import db_service
            db_service.save_audit_log(event_type, severity, details, user_id)
        except Exception:
            pass  # Never let DB errors break the main flow


audit_logger = AuditLogger()

