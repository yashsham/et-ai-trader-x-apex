"""
Supabase Client singleton.
Now uses the central 'settings' object for validated credentials.
"""
from app.core.config import settings

_client = None

def get_supabase():
    global _client
    if _client is not None:
        return _client

    if not settings or not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        print("[Supabase] SUPABASE_URL / SUPABASE_ANON_KEY not configured.")
        return None

    try:
        from supabase import create_client
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        print("✅ [Supabase] Client initialized successfully.")
        return _client
    except Exception as e:
        print(f"❌ [Supabase] Connection failed: {e}")
        return None
