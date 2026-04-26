"""
Simple in-memory rate limiting for Eventique.
Thread-safe counter per IP/endpoint.
"""

from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import HTTPException, Request, status
import threading
from typing import Optional

# Rate limit store: {(ip, endpoint): [timestamp, ...]}
_rate_limit_store = defaultdict(list)
_store_lock = threading.Lock()


def get_client_ip(request: Request) -> str:
    """Extract client IP from request (X-Forwarded-For or remote_addr)."""
    if x_forwarded_for := request.headers.get("x-forwarded-for"):
        return x_forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def check_rate_limit(
    client_ip: str,
    max_requests: int,
    window_seconds: int,
    endpoint: str = "global",
) -> None:
    """
    Check if client IP exceeds rate limit for endpoint.
    Raises HTTPException 429 if limit exceeded.
    """
    key = (client_ip, endpoint)
    now = datetime.now()
    cutoff = now - timedelta(seconds=window_seconds)

    with _store_lock:
        # Clean old entries
        if key in _rate_limit_store:
            _rate_limit_store[key] = [
                ts for ts in _rate_limit_store[key] if ts > cutoff
            ]

        # Check limit
        count = len(_rate_limit_store[key])
        if count >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded ({max_requests}/{window_seconds}s).",
            )

        # Add request
        _rate_limit_store[key].append(now)
