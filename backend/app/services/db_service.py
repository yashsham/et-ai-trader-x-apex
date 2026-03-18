"""
Database Service — abstracts all Supabase operations.
All methods are no-ops if Supabase is not configured.
"""
import json
from typing import Optional, Dict, Any, List
from app.core.supabase_client import get_supabase


class DBService:

    # ── Analysis Results ──────────────────────────────────────────
    def save_analysis(self, symbol: str, decision_output: str, portfolio: dict = {}) -> Optional[dict]:
        """Persist a CrewAI analysis result to Supabase."""
        sb = get_supabase()
        if not sb:
            return None
        try:
            # Extract top-level decision keyword (BUY/SELL/HOLD) from output
            output_upper = decision_output.upper()
            if "BUY" in output_upper:
                decision = "BUY"
            elif "SELL" in output_upper:
                decision = "SELL"
            elif "HOLD" in output_upper:
                decision = "HOLD"
            else:
                decision = "UNKNOWN"

            result = sb.table("analysis_results").insert({
                "symbol": symbol,
                "decision": decision,
                "decision_output": decision_output,
                "portfolio": portfolio if portfolio else {},
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"[DB] save_analysis error: {e}")
            return None

    def get_analysis_history(self, symbol: str, limit: int = 10) -> List[dict]:
        """Fetch past analyses for a symbol, newest first."""
        sb = get_supabase()
        if not sb:
            return []
        try:
            result = (
                sb.table("analysis_results")
                .select("*")
                .eq("symbol", symbol)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data or []
        except Exception as e:
            print(f"[DB] get_analysis_history error: {e}")
            return []

    def get_all_analyses(self, limit: int = 50) -> List[dict]:
        """Fetch all recent analyses across all symbols."""
        sb = get_supabase()
        if not sb:
            return []
        try:
            result = (
                sb.table("analysis_results")
                .select("*")
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data or []
        except Exception as e:
            print(f"[DB] get_all_analyses error: {e}")
            return []

    # ── Watchlist ─────────────────────────────────────────────────
    def add_to_watchlist(self, symbol: str) -> Optional[dict]:
        """Upsert a symbol into the watchlist."""
        sb = get_supabase()
        if not sb:
            return None
        try:
            result = (
                sb.table("watchlist")
                .upsert({"symbol": symbol}, on_conflict="symbol")
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"[DB] add_to_watchlist error: {e}")
            return None

    def remove_from_watchlist(self, symbol: str) -> bool:
        """Remove a symbol from the watchlist."""
        sb = get_supabase()
        if not sb:
            return False
        try:
            sb.table("watchlist").delete().eq("symbol", symbol).execute()
            return True
        except Exception as e:
            print(f"[DB] remove_from_watchlist error: {e}")
            return False

    def get_watchlist(self) -> List[dict]:
        """Get all watchlist symbols, newest first."""
        sb = get_supabase()
        if not sb:
            return []
        try:
            result = (
                sb.table("watchlist")
                .select("*")
                .order("added_at", desc=True)
                .execute()
            )
            return result.data or []
        except Exception as e:
            print(f"[DB] get_watchlist error: {e}")
            return []

    # ── Audit Logs ────────────────────────────────────────────────
    def save_audit_log(
        self,
        event_type: str,
        severity: str,
        details: Dict[str, Any],
        user_id: str = "anonymous",
    ) -> None:
        """Persist an audit log entry to Supabase (fire-and-forget)."""
        sb = get_supabase()
        if not sb:
            return
        try:
            sb.table("audit_logs").insert({
                "event_type": event_type,
                "severity": severity,
                "user_id": user_id,
                "details": details,
            }).execute()
        except Exception as e:
            # Never let DB errors affect the main flow
            print(f"[DB] save_audit_log error: {e}")


    # ── User Settings ─────────────────────────────────────────────
    def get_settings(self, user_id: str = "default_user") -> Optional[dict]:
        """Fetch user settings from DB."""
        sb = get_supabase()
        if not sb:
            return None
        try:
            result = sb.table("user_settings").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"[DB] get_settings error: {e}")
            return None

    def update_settings(self, settings_data: dict, user_id: str = "default_user") -> Optional[dict]:
        """Update or insert user settings in DB."""
        sb = get_supabase()
        if not sb:
            return None
        try:
            data = {"id": user_id, **settings_data}
            result = sb.table("user_settings").upsert(data, on_conflict="id").execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"[DB] update_settings error: {e}")
            return None


db_service = DBService()
