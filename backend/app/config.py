from pathlib import Path
from typing import Annotated, Literal

from pydantic import Field, IPvAnyAddress, SecretStr, TypeAdapter, field_validator
from pydantic.networks import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import URL

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
HTTP_URL = TypeAdapter(AnyHttpUrl)


class EnvironmentSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
        hide_input_in_errors=True,
    )


class Settings(EnvironmentSettings):
    postgres_host: str = Field(default="127.0.0.1", min_length=1)
    postgres_port: Annotated[int, Field(ge=1, le=65535)] = 55432
    postgres_db: str = Field(default="tibon", min_length=1)
    postgres_user: str = Field(default="tibon", min_length=1)
    postgres_password: SecretStr = Field(min_length=1)
    postgres_sslmode: Literal[
        "disable", "prefer", "require", "verify-ca", "verify-full"
    ] = "prefer"
    cors_origins: list[str] = Field(default_factory=list)
    trusted_proxy_ips: list[IPvAnyAddress] = Field(default_factory=list)
    api_docs_enabled: bool = True
    database_health_enabled: bool = True
    menu_pdf_dir: Path = Path(__file__).resolve().parents[1] / "private-menus"

    @field_validator("cors_origins")
    @classmethod
    def validate_origins(cls, origins: list[str]) -> list[str]:
        for origin in origins:
            url = HTTP_URL.validate_python(origin)
            # Browsers serialize an origin without a path or a default port.
            default_port = 443 if url.scheme == "https" else 80
            authority = url.host
            if url.port is not None and url.port != default_port:
                authority = f"{authority}:{url.port}"
            if origin != f"{url.scheme}://{authority}":
                raise ValueError("CORS origins must be exact HTTP(S) origins")
        return origins

    @property
    def database_url(self) -> URL:
        return URL.create(
            "postgresql+asyncpg",
            username=self.postgres_user,
            password=self.postgres_password.get_secret_value(),
            host=self.postgres_host,
            port=self.postgres_port,
            database=self.postgres_db,
        )


class NotificationSettings(EnvironmentSettings):
    notification_provider: Literal["vk", "max"] = "vk"
    vk_community_token: SecretStr = SecretStr("")
    vk_peer_id: str = ""
    max_bot_token: SecretStr = SecretStr("")
    max_chat_id: str = ""
    max_ca_file: Path | None = None
