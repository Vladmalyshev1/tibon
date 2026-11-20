import re
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


class TelegramSettings(EnvironmentSettings):
    telegram_bot_token: SecretStr | None = None
    telegram_chat_id: Annotated[int, Field(gt=-(2**52), lt=2**52)] | None = None

    @field_validator("telegram_bot_token", "telegram_chat_id", mode="before")
    @classmethod
    def treat_blank_as_missing(cls, value: object) -> object:
        return None if isinstance(value, str) and not value.strip() else value

    @field_validator("telegram_bot_token")
    @classmethod
    def validate_bot_token(cls, value: SecretStr | None) -> SecretStr | None:
        if value is not None and not re.fullmatch(
            r"[0-9]+:[A-Za-z0-9_-]+", value.get_secret_value()
        ):
            raise ValueError("Invalid Telegram bot token")
        return value

    @field_validator("telegram_chat_id")
    @classmethod
    def validate_chat_id(cls, value: int | None) -> int | None:
        if value == 0:
            raise ValueError("Telegram chat ID cannot be zero")
        return value
