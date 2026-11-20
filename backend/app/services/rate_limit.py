from collections import OrderedDict
from math import ceil
from time import monotonic


class LeadRateLimit:
    def __init__(self, limit: int = 8, window: int = 60, max_clients: int = 4096):
        self.limit = limit
        self.window = window
        self.max_clients = max_clients
        self.clients: OrderedDict[str, tuple[float, int]] = OrderedDict()

    def retry_after(self, client: str) -> int | None:
        now = monotonic()
        while self.clients and next(iter(self.clients.values()))[0] <= now:
            self.clients.popitem(last=False)

        if client in self.clients:
            expires, attempts = self.clients[client]
            if attempts >= self.limit:
                return ceil(expires - now)
            self.clients[client] = expires, attempts + 1
        elif len(self.clients) >= self.max_clients:
            return ceil(next(iter(self.clients.values()))[0] - now)
        else:
            self.clients[client] = now + self.window, 1
        return None
