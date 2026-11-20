from collections import OrderedDict, deque
from ipaddress import IPv6Address, IPv6Network, ip_address
from math import ceil
from time import monotonic


def client_bucket(host: str | None) -> str:
    try:
        address = ip_address(host) if host is not None else None
    except ValueError:
        return "unknown"
    if isinstance(address, IPv6Address):
        if address.ipv4_mapped is not None:
            return str(address.ipv4_mapped)
        return str(IPv6Network((int(address), 64), strict=False).network_address)
    return str(address) if address is not None else "unknown"


class LeadRateLimit:
    def __init__(self, limit: int = 8, window: int = 60, max_clients: int = 4096):
        self.limit = limit
        self.window = window
        self.max_clients = max_clients
        self.clients: OrderedDict[str, deque[float]] = OrderedDict()
        self.overflow: deque[float] = deque()

    def retry_after(self, host: str | None) -> int | None:
        client = client_bucket(host)
        now = monotonic()
        cutoff = now - self.window
        while self.clients and next(iter(self.clients.values()))[-1] <= cutoff:
            self.clients.popitem(last=False)

        attempts = self.clients.get(client)
        if attempts is None:
            if len(self.clients) >= self.max_clients:
                return self._record(self.overflow, now, cutoff)
            attempts = self.clients[client] = deque()
        wait = self._record(attempts, now, cutoff)
        if wait is None:
            self.clients.move_to_end(client)
        return wait

    def _record(self, attempts: deque[float], now: float, cutoff: float) -> int | None:
        while attempts and attempts[0] <= cutoff:
            attempts.popleft()
        if len(attempts) >= self.limit:
            return ceil(attempts[0] + self.window - now)
        attempts.append(now)
        return None
