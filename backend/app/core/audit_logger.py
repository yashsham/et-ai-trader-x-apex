"""
High-Performance Async Audit Logger
Uses the Producer-Consumer pattern (Thread + Queue) to ensure logging I/O 
never blocks the main request-response cycle.
"""
import json
import time
import queue
import threading
from typing import Dict, Any


class AuditLogger:
    def __init__(self):
        self._queue = queue.Queue(maxsize=1000)
        self._stop_event = threading.Event()
        self._worker_thread = threading.Thread(target=self._worker, daemon=True)
        self._worker_thread.start()

    def log_event(self, event_type: str, severity: str, details: Dict[str, Any], user_id: str = "anonymous"):
        """Producer: Puts log event in an in-memory queue (instant O(1))."""
        entry = {
            "timestamp": time.time(),
            "event_type": event_type,
            "severity": severity,
            "user_id": user_id,
            "details": details
        }
        print(json.dumps(entry))
        
        try:
            # Non-blocking put to avoid memory pressure if consumer hangs
            self._queue.put_nowait(entry)
        except queue.Full:
            print("[AuditLogger] Queue full — dropping log event.")

    def _worker(self):
        """Consumer: Processes logs in a background thread."""
        while not self._stop_event.is_set():
            try:
                # Wait for entry with timeout to allow thread exit
                entry = self._queue.get(timeout=2)
                self._persist(entry)
                self._queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                print(f"[AuditLogger] Worker error: {e}")

    def _persist(self, entry: Dict[str, Any]):
        """Actual I/O operation (blocking, but isolated in worker thread)."""
        try:
            from app.services.db_service import db_service
            db_service.save_audit_log(
                entry["event_type"], 
                entry["severity"], 
                entry["details"], 
                entry["user_id"]
            )
        except Exception:
            pass # DB errors are non-critical

    def shutdown(self):
        self._stop_event.set()
        self._worker_thread.join(timeout=1)


audit_logger = AuditLogger()
