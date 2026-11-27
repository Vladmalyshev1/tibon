import asyncio
import logging
import ssl
from hashlib import blake2s
from pathlib import Path
from re import fullmatch
from typing import Protocol
from uuid import UUID

import httpx

from app.config import NotificationSettings

VK_API = "https://api.vk.com/method/messages.send"
MAX_API = "https://platform-api2.max.ru/messages"
REQUEST_TIMEOUT = 10


class NotificationProvider(Protocol):
    name: str

    async def send_message(self, notification_id: UUID, message: str) -> None: ...


class NotificationConfigurationError(Exception):
    pass


class NotificationDeliveryError(Exception):
    def __init__(self, code: str, *, retry: bool, retry_after: int = 0):
        super().__init__(code)
        self.code = code
        self.retry = retry
        self.retry_after = retry_after


def notification_http_client(
    *, ca_file: Path | None = None, transport: httpx.AsyncBaseTransport | None = None
) -> httpx.AsyncClient:
    for name in ("httpx", "httpcore"):
        logging.getLogger(name).setLevel(logging.CRITICAL + 1)
    verify = True
    if ca_file is not None:
        try:
            verify = ssl.create_default_context()
            verify.load_verify_locations(cafile=str(ca_file))
        except OSError:
            raise NotificationConfigurationError(
                "MAX_CA_FILE must point to a readable PEM CA bundle."
            ) from None
    return httpx.AsyncClient(
        timeout=REQUEST_TIMEOUT,
        follow_redirects=False,
        trust_env=False,
        verify=verify,
        transport=transport,
    )


async def post_message(http: httpx.AsyncClient, url: str, **kwargs) -> dict:
    try:
        async with asyncio.timeout(REQUEST_TIMEOUT):
            response = await http.post(url, **kwargs)
    except (TimeoutError, httpx.RequestError):
        raise NotificationDeliveryError("network", retry=True) from None

    status = response.status_code
    if status == 429:
        value = response.headers.get("Retry-After", "")
        delay = (
            int(value)
            if value.isascii() and value.isdecimal() and len(value) <= 9
            else 0
        )
        raise NotificationDeliveryError("rate_limited", retry=True, retry_after=delay)
    if status in {401, 403}:
        raise NotificationDeliveryError("authorization", retry=False)
    if status == 408 or status >= 500:
        raise NotificationDeliveryError("provider_unavailable", retry=True)
    if 400 <= status < 500:
        raise NotificationDeliveryError("provider_rejected", retry=False)
    if response.is_success:
        try:
            body = response.json()
        except (ValueError, RecursionError):
            body = None
        if isinstance(body, dict):
            return body
    raise NotificationDeliveryError("invalid_response", retry=True)


class VKNotificationProvider:
    name = "vk"

    def __init__(self, http: httpx.AsyncClient, token: str, peer_id: int):
        self._http = http
        self._token = token
        self._peer_id = peer_id

    async def send_message(self, notification_id: UUID, message: str) -> None:
        digest = blake2s(notification_id.bytes, digest_size=4).digest()
        random_id = (int.from_bytes(digest, "big") & 0x7FFFFFFF) or 1
        body = await post_message(
            self._http,
            VK_API,
            data={
                "access_token": self._token,
                "v": "5.199",
                "peer_id": self._peer_id,
                "random_id": random_id,
                "message": message,
            },
        )
        error = body.get("error")
        code = error.get("error_code") if isinstance(error, dict) else None
        if type(code) is int:
            if code in {6, 9, 29}:
                raise NotificationDeliveryError("rate_limited", retry=True)
            if code in {1, 10}:
                raise NotificationDeliveryError("provider_unavailable", retry=True)
            if code in {5, 7, 15, 27, 901, 917}:
                raise NotificationDeliveryError("authorization", retry=False)
            raise NotificationDeliveryError("provider_rejected", retry=False)
        message_id = body.get("response")
        if "error" in body or type(message_id) is not int or message_id < 0:
            raise NotificationDeliveryError("invalid_response", retry=True)


class MaxNotificationProvider:
    name = "max"

    def __init__(self, http: httpx.AsyncClient, token: str, chat_id: int):
        self._http = http
        self._token = token
        self._chat_id = chat_id

    async def send_message(self, notification_id: UUID, message: str) -> None:
        body = await post_message(
            self._http,
            MAX_API,
            headers={"Authorization": self._token},
            params={"chat_id": self._chat_id},
            json={"text": message, "notify": True},
        )
        if body.get("success") is False:
            raise NotificationDeliveryError("provider_rejected", retry=False)
        sent_message = body.get("message")
        message_body = (
            sent_message.get("body") if isinstance(sent_message, dict) else None
        )
        message_id = message_body.get("mid") if isinstance(message_body, dict) else None
        if not isinstance(message_id, str) or not message_id:
            raise NotificationDeliveryError("invalid_response", retry=True)


def create_notification_provider(
    settings: NotificationSettings, http: httpx.AsyncClient
) -> NotificationProvider:
    if settings.notification_provider == "vk":
        token = settings.vk_community_token.get_secret_value()
        peer_id = destination_id(
            token, settings.vk_peer_id, "VK_COMMUNITY_TOKEN", "VK_PEER_ID"
        )
        return VKNotificationProvider(http, token, peer_id)
    token = settings.max_bot_token.get_secret_value()
    chat_id = destination_id(
        token, settings.max_chat_id, "MAX_BOT_TOKEN", "MAX_CHAT_ID"
    )
    return MaxNotificationProvider(http, token, chat_id)


def destination_id(token: str, raw_id: str, token_name: str, id_name: str) -> int:
    if (
        not token
        or not token.isascii()
        or not all(33 <= ord(char) <= 126 for char in token)
    ):
        raise NotificationConfigurationError(f"Set {token_name} to a valid token.")
    raw_id = raw_id.strip()
    value = int(raw_id) if fullmatch(r"-?[0-9]{1,19}", raw_id) else 0
    if not -(2**63) <= value < 2**63 or value == 0:
        raise NotificationConfigurationError(f"Set {id_name} to a non-zero integer ID.")
    return value
