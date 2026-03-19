import os
from typing import List
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(".env")

def check_schema():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase credentials in .env")
        return

    print(f"Connecting to: {url}")
    sb: Client = create_client(url, key)
    
    tables_to_check = [
        "analysis_results",
        "watchlist",
        "audit_logs",
        "user_settings",
        "portfolio_holdings",
        "news_snapshots",
        "chart_snapshots"
    ]
    
    print("\n--- SCHEMA AUDIT ---")
    for table in tables_to_check:
        try:
            # Attempt a select to see if table exists
            res = sb.table(table).select("*").limit(1).execute()
            print(f"✅ Table '{table}' exists.")
            
            # Check specific new columns for user_settings
            if table == "user_settings":
                data = res.data[0] if res.data else {}
                for col in ["risk_profile", "theme_mode", "assistant_memory_enabled"]:
                    if col in data:
                        print(f"  - Column '{col}' found.")
                    else:
                        print(f"  - ❌ Column '{col}' MISSING.")
            
            # Check sector for portfolio_holdings
            if table == "portfolio_holdings":
                data = res.data[0] if res.data else {}
                if "sector" in data:
                    print(f"  - Column 'sector' found.")
                else:
                    print(f"  - ❌ Column 'sector' MISSING.")

        except Exception as e:
            if "does not exist" in str(e).lower():
                print(f"❌ Table '{table}' MISSING.")
            else:
                print(f"⚠️ Table '{table}' check error: {e}")

if __name__ == "__main__":
    check_schema()
