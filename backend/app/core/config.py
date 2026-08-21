from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	supabase_url: str | None = None
	supabase_service_key: str | None = Field(
		default=None,
		validation_alias=AliasChoices("SUPABASE_SERVICE_KEY", "SUPABASE_KEY"),
	)
	max_upload_size_mb: int = 10
	cors_origins: str = "http://localhost:5173,http://localhost:5174"

	model_config = SettingsConfigDict(env_file=".env", extra="ignore")

	@property
	def cors_origin_list(self) -> list[str]:
		return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
	return Settings()
