#!/usr/bin/env python3
"""
Seed and validate Eventique QA event scenarios through the public API.

This runner is safe for the Raspberry Pi deployment because it uses the same
HTTP contracts as the admin UI. It never writes SQLite directly and it does not
create event-specific admin tokens by default.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from dataclasses import dataclass, field
from typing import Any
from urllib.parse import urlparse

import requests

from event_scenario_catalog import (
    DEFAULT_COUNT,
    DEFAULT_PREFIX,
    DEFAULT_PUBLIC_BASE_URL,
    build_scenarios,
    summarize_coverage,
)


@dataclass
class RunStats:
    created: int = 0
    updated: int = 0
    skipped: int = 0
    guests_created: int = 0
    guests_skipped: int = 0
    rsvps_upserted: int = 0
    validated: int = 0
    frontend_validated: int = 0
    deleted: int = 0
    errors: list[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.errors


class EventiqueApi:
    def __init__(self, base_url: str, token: str, timeout: float = 15.0) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"Bearer {token}"})

    def health(self) -> dict[str, Any]:
        return self._request("GET", "/health")

    def list_events(self) -> list[dict[str, Any]]:
        return self._request("GET", "/events")

    def create_event(self, *, name: str, slug: str) -> dict[str, Any]:
        return self._request("POST", "/events", json={"name": name, "slug": slug})

    def delete_event(self, slug: str) -> None:
        self._request("DELETE", f"/events/{slug}", expected=(204,))

    def put_config(self, slug: str, config: dict[str, Any]) -> dict[str, Any]:
        return self._request("PUT", f"/events/{slug}/event-config", json=config)

    def get_config(self, slug: str) -> dict[str, Any]:
        return self._request("GET", f"/events/{slug}/event-config")

    def list_guests(self, slug: str) -> list[dict[str, Any]]:
        data = self._request("GET", f"/events/{slug}/guests", params={"page": 1, "limit": 200})
        if isinstance(data, dict):
            return data.get("items", [])
        return data if isinstance(data, list) else []

    def create_guest(self, slug: str, payload: dict[str, Any]) -> dict[str, Any]:
        return self._request("POST", f"/events/{slug}/guests", json=payload)

    def upsert_rsvp(self, slug: str, payload: dict[str, Any]) -> dict[str, Any]:
        return self._request("POST", f"/events/{slug}/rsvp", json=payload, auth=False)

    def _request(
        self,
        method: str,
        path: str,
        *,
        expected: tuple[int, ...] = (200, 201),
        auth: bool = True,
        **kwargs: Any,
    ) -> Any:
        headers = kwargs.pop("headers", {})
        if not auth:
            headers = {**headers, "Authorization": ""}
        response = self.session.request(
            method,
            f"{self.base_url}{path}",
            timeout=self.timeout,
            headers=headers,
            **kwargs,
        )
        if response.status_code not in expected:
            body = _safe_body(response)
            raise RuntimeError(f"{method} {path} -> HTTP {response.status_code}: {body}")
        if response.status_code == 204 or not response.content:
            return None
        return response.json()


def seed_scenarios(
    api: EventiqueApi,
    scenarios: list[dict[str, Any]],
    *,
    include_guests: bool,
    include_rsvps: bool,
    throttle_seconds: float,
) -> RunStats:
    stats = RunStats()
    existing = {event["slug"]: event for event in api.list_events()}
    for scenario in scenarios:
        slug = scenario["slug"]
        try:
            if slug in existing:
                stats.skipped += 1
            else:
                api.create_event(name=scenario["name"], slug=slug)
                stats.created += 1
            api.put_config(slug, scenario["config"])
            stats.updated += 1
            if include_guests:
                guests = api.list_guests(slug)
                guest_email = scenario["sample_guest"]["email"]
                if any(g.get("email") == guest_email for g in guests):
                    stats.guests_skipped += 1
                else:
                    api.create_guest(slug, scenario["sample_guest"])
                    stats.guests_created += 1
            if include_rsvps and scenario["config"].get("allow_public_rsvp", True):
                api.upsert_rsvp(slug, scenario["sample_rsvp"])
                stats.rsvps_upserted += 1
            _sleep(throttle_seconds)
        except Exception as exc:  # noqa: BLE001 - CLI should aggregate failures
            stats.errors.append(f"{slug}: {exc}")
    return stats


def validate_scenarios(
    api: EventiqueApi,
    scenarios: list[dict[str, Any]],
    *,
    frontend_url: str | None,
    throttle_seconds: float,
) -> RunStats:
    stats = RunStats()
    existing = {event["slug"]: event for event in api.list_events()}
    frontend_base = frontend_url.rstrip("/") if frontend_url else None
    for scenario in scenarios:
        slug = scenario["slug"]
        try:
            if slug not in existing:
                raise RuntimeError("event missing")
            config = api.get_config(slug)
            _validate_config(slug, scenario, config)
            stats.validated += 1
            if frontend_base:
                _validate_frontend(frontend_base, slug)
                stats.frontend_validated += 1
            _sleep(throttle_seconds)
        except Exception as exc:  # noqa: BLE001
            stats.errors.append(f"{slug}: {exc}")
    return stats


def cleanup_scenarios(api: EventiqueApi, prefix: str) -> RunStats:
    stats = RunStats()
    for event in api.list_events():
        slug = event["slug"]
        if slug.startswith(f"{prefix}-"):
            try:
                api.delete_event(slug)
                stats.deleted += 1
            except Exception as exc:  # noqa: BLE001
                stats.errors.append(f"{slug}: {exc}")
    return stats


def merge_stats(*items: RunStats) -> RunStats:
    merged = RunStats()
    for item in items:
        merged.created += item.created
        merged.updated += item.updated
        merged.skipped += item.skipped
        merged.guests_created += item.guests_created
        merged.guests_skipped += item.guests_skipped
        merged.rsvps_upserted += item.rsvps_upserted
        merged.validated += item.validated
        merged.frontend_validated += item.frontend_validated
        merged.deleted += item.deleted
        merged.errors.extend(item.errors)
    return merged


def _validate_config(slug: str, expected: dict[str, Any], actual: dict[str, Any]) -> None:
    required_top = ["event_type", "couple", "dates", "venues", "theme", "sections", "music", "invitation_skin"]
    for key in required_top:
        if key not in actual:
            raise RuntimeError(f"missing config key: {key}")
    dimensions = expected["dimensions"]
    if actual["event_type"] != expected["event_type"]:
        raise RuntimeError(f"event_type mismatch: {actual['event_type']} != {expected['event_type']}")
    if actual["invitation_skin"] != dimensions["skin"]:
        raise RuntimeError(f"skin mismatch: {actual['invitation_skin']} != {dimensions['skin']}")
    if actual.get("invitation_mode") != dimensions["invitation_mode"]:
        raise RuntimeError("invitation_mode mismatch")
    qa = actual.get("qa_scenario") or {}
    if qa.get("scenario_number") != expected["config"]["qa_scenario"]["scenario_number"]:
        raise RuntimeError("qa_scenario metadata mismatch")
    tracks = ((actual.get("music") or {}).get("tracks") or [])
    if dimensions["music_profile"] == "disabled" and tracks:
        raise RuntimeError("disabled music profile has tracks")
    if dimensions["music_profile"] != "disabled" and not tracks:
        raise RuntimeError("music profile expected at least one track")
    if dimensions["skin"] == "paper-access" and actual.get("theme", {}).get("palette") != "paper-olive":
        raise RuntimeError("paper-access must use paper-olive in QA scenarios")
    if not actual.get("sections", {}).get("rsvp", {}).get("enabled", False):
        raise RuntimeError("RSVP section disabled")
    if len(slug) > 100:
        raise RuntimeError("slug exceeds API length limit")


def _validate_frontend(frontend_base: str, slug: str) -> None:
    url = f"{frontend_base}/e/{slug}"
    response = requests.get(url, timeout=15)
    if response.status_code != 200:
        raise RuntimeError(f"frontend route HTTP {response.status_code}")
    content_type = response.headers.get("content-type", "")
    if "text/html" not in content_type:
        raise RuntimeError(f"frontend route content-type unexpected: {content_type}")


def _safe_body(response: requests.Response) -> str:
    try:
        return json.dumps(response.json(), ensure_ascii=False)
    except Exception:  # noqa: BLE001
        return response.text[:500]


def _sleep(seconds: float) -> None:
    if seconds > 0:
        time.sleep(seconds)


def _default_frontend_url(base_url: str) -> str:
    parsed = urlparse(base_url)
    if parsed.path.rstrip("/") == "/api":
        return base_url[: -len("/api")]
    return f"{parsed.scheme}://{parsed.netloc}"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed and validate 50 Eventique QA event scenarios.")
    parser.add_argument("--base-url", default=os.getenv("EVENTIQUE_API_URL", "http://localhost:5176/api"))
    parser.add_argument("--frontend-url", default=os.getenv("EVENTIQUE_FRONTEND_URL"))
    parser.add_argument("--public-base-url", default=os.getenv("PUBLIC_BASE_URL", DEFAULT_PUBLIC_BASE_URL))
    parser.add_argument("--token", default=os.getenv("ADMIN_TOKEN"))
    parser.add_argument("--count", type=int, default=int(os.getenv("EVENTIQUE_SCENARIO_COUNT", DEFAULT_COUNT)))
    parser.add_argument("--prefix", default=os.getenv("EVENTIQUE_SCENARIO_PREFIX", DEFAULT_PREFIX))
    parser.add_argument(
        "--action",
        choices=["seed", "validate", "seed-validate", "cleanup"],
        default="seed-validate",
    )
    parser.add_argument("--include-guests", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--include-rsvps", action=argparse.BooleanOptionalAction, default=False)
    parser.add_argument("--throttle-seconds", type=float, default=float(os.getenv("EVENTIQUE_SCENARIO_THROTTLE", "0")))
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON summary.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.token:
        print("ERROR: --token or ADMIN_TOKEN is required", file=sys.stderr)
        return 2

    scenarios = build_scenarios(
        count=args.count,
        prefix=args.prefix,
        public_base_url=args.public_base_url,
    )
    api = EventiqueApi(args.base_url, args.token)
    api.health()

    coverage = summarize_coverage(scenarios)
    frontend_url = args.frontend_url or _default_frontend_url(args.base_url)
    stats = RunStats()

    if args.action == "cleanup":
        stats = cleanup_scenarios(api, args.prefix)
    elif args.action == "seed":
        stats = seed_scenarios(
            api,
            scenarios,
            include_guests=args.include_guests,
            include_rsvps=args.include_rsvps,
            throttle_seconds=args.throttle_seconds,
        )
    elif args.action == "validate":
        stats = validate_scenarios(
            api,
            scenarios,
            frontend_url=frontend_url,
            throttle_seconds=args.throttle_seconds,
        )
    else:
        seed_stats = seed_scenarios(
            api,
            scenarios,
            include_guests=args.include_guests,
            include_rsvps=args.include_rsvps,
            throttle_seconds=args.throttle_seconds,
        )
        validate_stats = validate_scenarios(
            api,
            scenarios,
            frontend_url=frontend_url,
            throttle_seconds=args.throttle_seconds,
        )
        stats = merge_stats(seed_stats, validate_stats)

    summary = {
        "ok": stats.ok,
        "action": args.action,
        "base_url": args.base_url,
        "frontend_url": frontend_url,
        "prefix": args.prefix,
        "coverage": coverage,
        "stats": stats.__dict__,
    }
    if args.json:
        print(json.dumps(summary, indent=2, ensure_ascii=False))
    else:
        _print_summary(summary)
    return 0 if stats.ok else 1


def _print_summary(summary: dict[str, Any]) -> None:
    stats = summary["stats"]
    print("\nEventique scenario runner")
    print(f"  action:             {summary['action']}")
    print(f"  base_url:           {summary['base_url']}")
    print(f"  frontend_url:       {summary['frontend_url']}")
    print(f"  prefix:             {summary['prefix']}")
    print(f"  scenarios:          {summary['coverage']['total']}")
    print(f"  created:            {stats['created']}")
    print(f"  updated:            {stats['updated']}")
    print(f"  skipped existing:   {stats['skipped']}")
    print(f"  guests created:     {stats['guests_created']}")
    print(f"  guests skipped:     {stats['guests_skipped']}")
    print(f"  rsvps upserted:     {stats['rsvps_upserted']}")
    print(f"  api validated:      {stats['validated']}")
    print(f"  frontend validated: {stats['frontend_validated']}")
    print(f"  deleted:            {stats['deleted']}")
    print(f"  result:             {'OK' if summary['ok'] else 'FAILED'}")
    if stats["errors"]:
        print("\nErrors:")
        for error in stats["errors"]:
            print(f"  - {error}")


if __name__ == "__main__":
    raise SystemExit(main())
