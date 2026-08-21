from supabase import create_client, Client
from app.core.config import SUPABASE_URL, SUPABASE_KEY


if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase environment variables are missing")


supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)