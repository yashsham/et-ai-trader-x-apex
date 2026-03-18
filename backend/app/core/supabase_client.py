"""
Supabase Client — singleton initialisation.
Returns None gracefully if env vars are not set,
so the app keeps running even without DB configured.
"""
import os
from dotenv import load_dotenv

load_dotenv()

_client = None


def get_supabase():
    global _client
    if _client is not None:
        return _client

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")

    if not url or not key:
        print("[Supabase] SUPABASE_URL / SUPABASE_KEY not set — running without DB.")
        return None

    try:
        from supabase import create_client
        _client = create_client(url, key)
        print("[Supabase] Connected successfully.")
        return _client
    except Exception as e:
        print(f"[Supabase] Failed to connect: {e}")
        return None
