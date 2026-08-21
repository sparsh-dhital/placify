from functools import lru_cache
from typing import Any

from fastapi import HTTPException, status
from supabase import Client, create_client

from .config import get_settings


@lru_cache
def get_supabase() -> Client:
	settings = get_settings()
	if not settings.supabase_url or not settings.supabase_service_key:
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail="Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.",
		)
	try:
		return create_client(settings.supabase_url, settings.supabase_service_key)
	except Exception as exc:
		raise HTTPException(status_code=503, detail="Unable to connect to Supabase") from exc


def rows(response: Any) -> list[dict[str, Any]]:
	return list(response.data or [])


def one(response: Any) -> dict[str, Any] | None:
	values = rows(response)
	return values[0] if values else None
