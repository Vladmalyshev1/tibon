import asyncio
import logging
from typing import Literal

import httpx

from app.models.lead import Lead, LeadFormat, LeadSource

TELEGRAM_API = "https://api.telegram.org"
REQUEST_TIMEOUT = 10

FORMAT_LABELS = {
    LeadFormat.ADULTS: "Для взрослых",
    LeadFormat.KIDS: "Для детей",
    LeadFormat.CORPORATE: "Корпоратив",
    LeadFormat.BIRTHDAY: "День рождения",
    LeadFormat.ROMANTIC: "Романтический ужин",
    LeadFormat.RENTAL: "Аренда студии",
    LeadFormat.EXTRAS: "Дополнительные услуги",
}
SOURCE_LABELS = {
    LeadSource.MENU_ADULTS: "Запрос взрослого меню",
    LeadSource.MENU_KIDS: "Запрос детского меню",
}


def notification_text(lead: Lead) -> str:
    lines = [
        "Новая заявка TIBON",
        f"UUID: {lead.id}",
        f"Имя: {' '.join(lead.name.split())}",
        f"Телефон: {lead.phone}",
        f"Формат: {FORMAT_LABELS[lead.format]}",
    ]
    if lead.source:
        lines.append(f"Источник: {SOURCE_LABELS[lead.source]}")
    if lead.event_date:
        lines.append(f"Дата: {lead.event_date:%d.%m.%Y}")
    if lead.guests is not None:
        lines.append(f"Гостей: {lead.guests}")
    if lead.comment:
        lines.append(f"Комментарий: {' '.join(lead.comment.split())}")
    return "\n".join(lines)


class TelegramDeliveryError(Exception):
    def __init__(self, code: str, *, retry: bool, retry_after: int = 0):
        super().__init__(code)
        self.code = code
        self.retry = retry
        self.retry_after = retry_after


def telegram_http_client(
    *, transport: httpx.AsyncBaseTransport | None = None
) -> httpx.AsyncClient:
    # HTTPX's standard request log includes the token in the URL.
    for name in ("httpx", "httpcore"):
        logging.getLogger(name).setLevel(logging.CRITICAL + 1)
    return httpx.AsyncClient(
        base_url=TELEGRAM_API,
        timeout=REQUEST_TIMEOUT,
        follow_redirects=False,
        trust_env=False,
        transport=transport,
    )


class TelegramClient:
    def __init__(self, http: httpx.AsyncClient, token: str):
        self.http = http
        self._token = token

    async def _call(
        self, method: Literal["sendMessage", "getUpdates"], payload: dict
    ) -> object:
        try:
            async with asyncio.timeout(REQUEST_TIMEOUT):
                response = await self.http.post(
                    f"/bot{self._token}/{method}", json=payload
                )
        except (TimeoutError, httpx.RequestError):
            raise TelegramDeliveryError("network", retry=True) from None

        try:
            data = response.json()
        except (ValueError, RecursionError):
            data = None
        body = data if isinstance(data, dict) else {}
        if response.is_success and body.get("ok") is True:
            return body.get("result")

        code = response.status_code
        reported_code = body.get("error_code")
        if (
            response.is_success
            and body.get("ok") is False
            and type(reported_code) is int
        ):
            code = reported_code
        if code == 429:
            parameters = body.get("parameters")
            delay = (
                parameters.get("retry_after") if isinstance(parameters, dict) else None
            )
            retry_after = delay if type(delay) is int and 0 < delay < 2**31 else 0
            raise TelegramDeliveryError(
                "rate_limited", retry=True, retry_after=retry_after
            )
        if code == 408 or 500 <= code < 600:
            raise TelegramDeliveryError("telegram_unavailable", retry=True)
        if 400 <= code < 500:
            raise TelegramDeliveryError("telegram_rejected", retry=False)
        raise TelegramDeliveryError("invalid_response", retry=True)

    async def send_message(self, chat_id: int, message: str) -> None:
        result = await self._call(
            "sendMessage",
            {
                "chat_id": chat_id,
                "text": message,
                "protect_content": True,
                "link_preview_options": {"is_disabled": True},
            },
        )
        if not isinstance(result, dict) or type(result.get("message_id")) is not int:
            raise TelegramDeliveryError("invalid_response", retry=True)

    async def chat_ids(self) -> list[int]:
        updates = await self._call(
            "getUpdates", {"timeout": 0, "allowed_updates": ["message"]}
        )
        if not isinstance(updates, list):
            raise TelegramDeliveryError("invalid_response", retry=True)
        ids: set[int] = set()
        for update in updates:
            message = update.get("message") if isinstance(update, dict) else None
            if not isinstance(message, dict):
                continue
            text = message.get("text")
            chat = message.get("chat")
            commands = text.split(maxsplit=1) if isinstance(text, str) else []
            if (
                not commands
                or commands[0].split("@", 1)[0] != "/start"
                or not isinstance(chat, dict)
            ):
                continue
            chat_id = chat.get("id")
            if type(chat_id) is int:
                ids.add(chat_id)
        return sorted(ids)
