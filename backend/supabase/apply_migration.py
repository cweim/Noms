"""
Apply Supabase migrations manually
Usage: python supabase/apply_migration.py
"""
import os
from supabase import create_client

def apply_migration():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")

    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        return

    client = create_client(url, key)

    # Read migration file
    with open("supabase/migrations/20260113000001_create_core_schema.sql") as f:
        sql = f.read()

    # Execute migration
    try:
        client.postgrest.rpc("exec_sql", {"sql": sql}).execute()
        print("✅ Migration applied successfully")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("Note: Apply migration via Supabase Dashboard SQL Editor instead")

if __name__ == "__main__":
    apply_migration()
