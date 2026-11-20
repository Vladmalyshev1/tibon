import pytest
from pydantic import ValidationError

from app.config import Settings


def test_settings_load_dotenv_and_allow_environment_override(tmp_path, monkeypatch):
    env_file = tmp_path / ".env"
    env_file.write_text(
        'POSTGRES_PASSWORD="fake-p@ss:/#%word"\n'
        "POSTGRES_PORT=55432\n"
        'CORS_ORIGINS=\'["https://example.test","http://[::1]:5173"]\'\n',
        encoding="utf-8",
    )
    monkeypatch.delenv("POSTGRES_PASSWORD", raising=False)
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    monkeypatch.setenv("POSTGRES_PORT", "55433")
    settings = Settings(_env_file=env_file)

    assert settings.postgres_port == 55433
    assert settings.cors_origins == ["https://example.test", "http://[::1]:5173"]
    assert settings.database_url.drivername == "postgresql+asyncpg"
    assert settings.database_url.password == "fake-p@ss:/#%word"
    assert "fake-p" not in str(settings.database_url)
    assert "fake-p" not in repr(settings)


@pytest.mark.parametrize("password", [None, ""])
def test_requires_non_empty_database_password(monkeypatch, password):
    monkeypatch.delenv("POSTGRES_PASSWORD", raising=False)
    if password is not None:
        monkeypatch.setenv("POSTGRES_PASSWORD", password)
    with pytest.raises(ValidationError, match="postgres_password"):
        Settings(_env_file=None)


@pytest.mark.parametrize(
    "origin",
    [
        "*",
        "null",
        "file://example.test",
        "https://example.test/path",
        "https://example.test/",
        "https://example.test:443",
        "https://example.test/?",
        "https://user:password@example.test",
    ],
)
def test_rejects_invalid_cors_origins(origin):
    with pytest.raises(ValidationError, match="cors_origins"):
        Settings(_env_file=None, postgres_password="fake-secret", cors_origins=[origin])
