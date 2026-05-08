#!/usr/bin/env python3
"""
Create deterministic Eventique QA events directly in the configured database.

For production-like environments prefer scripts/seed_event_scenarios.py because
it exercises the public API. This DB seeder remains useful for local development
and offline fixture creation.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from api.database import SessionLocal, engine  # noqa: E402
from api.models import Base, Event, EventConfig  # noqa: E402
from event_scenario_catalog import (  # noqa: E402
    DEFAULT_COUNT,
    DEFAULT_PREFIX,
    DEFAULT_PUBLIC_BASE_URL,
    build_scenarios,
    summarize_coverage,
)


def create_test_events(
    *,
    count: int,
    prefix: str,
    public_base_url: str,
    reset: bool,
) -> bool:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    scenarios = build_scenarios(count=count, prefix=prefix, public_base_url=public_base_url)
    created = 0
    updated = 0
    deleted = 0

    try:
        if reset:
            slugs = [scenario["slug"] for scenario in scenarios]
            deleted = db.query(Event).filter(Event.slug.in_(slugs)).delete(synchronize_session=False)
            db.query(EventConfig).filter(EventConfig.event_slug.in_(slugs)).delete(synchronize_session=False)
            db.commit()

        for scenario in scenarios:
            slug = scenario["slug"]
            event = db.query(Event).filter(Event.slug == slug).first()
            if not event:
                event = Event(slug=slug, name=scenario["name"], admin_token=None)
                db.add(event)
                created += 1
            else:
                event.name = scenario["name"]

            row = db.query(EventConfig).filter(EventConfig.event_slug == slug).first()
            payload = json.dumps(scenario["config"], ensure_ascii=False)
            if row:
                row.event_type = scenario["event_type"]
                row.config_json = payload
            else:
                db.add(EventConfig(event_slug=slug, event_type=scenario["event_type"], config_json=payload))
            updated += 1

        db.commit()
        coverage = summarize_coverage(scenarios)
        print("Eventique QA scenarios created")
        print(f"  requested: {count}")
        print(f"  created:   {created}")
        print(f"  updated:   {updated}")
        print(f"  deleted:   {deleted}")
        print(f"  prefix:    {prefix}")
        print(f"  coverage:  {json.dumps(coverage, ensure_ascii=False)}")
        print()
        for scenario in scenarios:
            print(f"{scenario['id']} | {scenario['slug']} | {scenario['name']}")
        return True
    except Exception as exc:  # noqa: BLE001 - CLI should print root cause
        db.rollback()
        print(f"ERROR: {exc}", file=sys.stderr)
        return False
    finally:
        db.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create Eventique QA event scenarios in DB.")
    parser.add_argument("--count", type=int, default=DEFAULT_COUNT)
    parser.add_argument("--prefix", default=DEFAULT_PREFIX)
    parser.add_argument("--public-base-url", default=DEFAULT_PUBLIC_BASE_URL)
    parser.add_argument("--reset", action="store_true", help="Delete matching scenario events before creating them.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    ok = create_test_events(
        count=args.count,
        prefix=args.prefix,
        public_base_url=args.public_base_url,
        reset=args.reset,
    )
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
