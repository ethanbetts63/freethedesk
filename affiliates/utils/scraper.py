"""Finding podcasts with a published contact address.

A port of Bloomprint's ``marketing/utils/scraper.py``: the iTunes Search API's
AU store, every two-letter term from ``aa`` to ``zz``, 200 results a term, and
the show's RSS feed for the owner's address. The AU store is a proxy for
Australian shows and nothing more; a foreign host who signs up is still a
client, so there is no country step. The cursor (terms tried, feeds tried) is
committed JSON in ``affiliates/data/``; the server, not a local file, decides
whether an address is new (``upload_prospects``).
"""

import html
import json
import re
import socket
import time
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import requests

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
QUEUE_PATH = DATA_DIR / "podcasts.jsonl"
ARCHIVE_DIR = DATA_DIR / "archive"
TERMS_PATH = DATA_DIR / "searched_terms.json"
FEEDS_PATH = DATA_DIR / "searched_feeds.json"

ITUNES_NS = "http://www.itunes.com/dtds/podcast-1.0.dtd"
CONTENT_NS = "http://purl.org/rss/1.0/modules/content/"
MAX_EPISODES = 100
RECENT_DAYS = 30
MAX_URL = 500
MAX_DESCRIPTION = 1500
TERM_COUNT = 26 * 26


def _load_json(path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def _save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def load_searched_terms():
    return list(_load_json(TERMS_PATH, []))


def save_searched_terms(terms):
    _save_json(TERMS_PATH, list(terms))


def load_searched_feeds():
    return set(_load_json(FEEDS_PATH, []))


def save_searched_feeds(feeds):
    _save_json(FEEDS_PATH, sorted(feeds))


def load_queue(path=None):
    # Resolved at call time, not bound as a default: tests point QUEUE_PATH at a
    # temporary directory, and a default bound at import would ignore that and
    # write test entries into the real queue.
    path = path or QUEUE_PATH
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def save_queue(entries, path=None):
    path = path or QUEUE_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        for entry in entries:
            handle.write(json.dumps(entry, ensure_ascii=False) + "\n")


def append_entries(entries, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as handle:
        for entry in entries:
            handle.write(json.dumps(entry, ensure_ascii=False) + "\n")


def all_terms():
    for a in "abcdefghijklmnopqrstuvwxyz":
        for b in "abcdefghijklmnopqrstuvwxyz":
            yield a + b


def next_term(searched):
    searched = set(searched)
    for term in all_terms():
        if term not in searched:
            return term
    return None


def search_itunes(term):
    try:
        response = requests.get(
            "https://itunes.apple.com/search",
            params={"media": "podcast", "term": term, "limit": 200, "country": "AU"},
            timeout=15,
        )
        response.raise_for_status()
        return response.json().get("results", [])
    except (requests.RequestException, ValueError):
        return []


def _parse_release(date_str):
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


def is_recent(date_str, days=RECENT_DAYS):
    released = _parse_release(date_str)
    return released is not None and (datetime.now(timezone.utc) - released) <= timedelta(days=days)


def release_date(date_str):
    released = _parse_release(date_str)
    return released.date().isoformat() if released else None


def passes_itunes_filters(result):
    return (
        result.get("trackCount", 0) <= MAX_EPISODES
        and is_recent(result.get("releaseDate", ""))
        and bool(result.get("feedUrl"))
    )


def _text(element, tag, ns):
    return (element.findtext(tag, namespaces=ns) or "").strip()


def _strip_html(text):
    """Tags out, entities decoded: an opener is written from this, and "&amp;" is not a word."""
    text = html.unescape(re.sub(r"<[^>]+>", "", text))
    return re.sub(r"\s+", " ", text).strip()


def parse_rss(feed_url):
    try:
        response = requests.get(feed_url, timeout=15)
        response.raise_for_status()
    except requests.RequestException:
        return None
    return parse_rss_text(response.content)


def parse_rss_text(content):
    """The owner, address, site and latest episode from a feed, or None."""
    try:
        root = ET.fromstring(content)
    except ET.ParseError:
        return None
    channel = root.find("channel")
    if channel is None:
        return None
    ns = {"itunes": ITUNES_NS, "content": CONTENT_NS}

    language = _text(channel, "language", ns).lower()
    if language and not language.startswith("en"):
        return None

    host_name = (
        _text(channel, "itunes:owner/itunes:name", ns)
        or _text(channel, "itunes:author", ns)
        or _text(channel, "author", ns)
    )
    first_item = channel.find("item")
    if first_item is None:
        return None
    description = (
        _text(first_item, "content:encoded", ns)
        or _text(first_item, "description", ns)
        or _text(first_item, "itunes:summary", ns)
    )
    return {
        "host_name": host_name,
        "email": _text(channel, "itunes:owner/itunes:email", ns),
        "website": _text(channel, "link", ns),
        "latest_episode_title": _text(first_item, "title", ns),
        "latest_episode_description": _strip_html(description)[:MAX_DESCRIPTION],
    }


def email_domain_resolves(email):
    """Stale feeds advertise dead domains, and a hard bounce costs more than a lead."""
    domain = email.rpartition("@")[2].strip().lower()
    if not domain:
        return False
    try:
        socket.getaddrinfo(domain, None)
    except OSError:
        return False
    return True


def has_required_fields(rss):
    return all(
        rss.get(key)
        for key in ("host_name", "email", "website", "latest_episode_title", "latest_episode_description")
    )


def urls_fit(entry):
    return all(len(entry[key]) <= MAX_URL for key in ("email_source", "website", "apple_url"))


def build_entry(result, rss, feed_url):
    return {
        "email": rss["email"].strip().lower(),
        "email_source": feed_url,
        "podcast_name": (result.get("collectionName") or "").strip()[:255],
        "host_name": rss["host_name"][:255],
        "website": rss["website"],
        "apple_url": (result.get("collectionViewUrl") or "").strip(),
        "genre": (result.get("primaryGenreName") or "").strip()[:255],
        "episode_count": int(result.get("trackCount") or 0),
        "latest_episode_title": rss["latest_episode_title"][:255],
        "latest_episode_description": rss["latest_episode_description"],
        "last_release_date": release_date(result.get("releaseDate", "")),
        "opener": "",
        "scraped_on": date.today().isoformat(),
    }


def scrape_term(term, searched_feeds, queued_emails, write, limit=None, pause=0.4):
    """Search one term and append qualifying shows to the queue.

    Returns ``(written, skipped)``. ``searched_feeds`` and ``queued_emails`` are
    updated in place.
    """
    write(f"[{term}] Searching iTunes...")
    results = search_itunes(term)
    write(f"  {len(results)} results returned")
    written = skipped = dead = 0

    for result in results:
        if limit is not None and written >= limit:
            break
        feed_url = (result.get("feedUrl") or "").strip()
        if not feed_url or feed_url in searched_feeds:
            skipped += 1
            continue
        searched_feeds.add(feed_url)
        if not passes_itunes_filters(result):
            skipped += 1
            continue

        time.sleep(pause)
        rss = parse_rss(feed_url)
        if rss is None or not has_required_fields(rss):
            skipped += 1
            continue
        entry = build_entry(result, rss, feed_url)
        if entry["email"] in queued_emails or not urls_fit(entry):
            skipped += 1
            continue
        if not email_domain_resolves(entry["email"]):
            skipped += 1
            dead += 1
            write(f"  ~ skipping <{entry['email']}> (domain does not resolve)")
            continue

        append_entries([entry], QUEUE_PATH)
        queued_emails.add(entry["email"])
        written += 1
        write(f"  + {entry['podcast_name']}  <{entry['email']}>")

    write(f"  Written: {written}  |  Skipped: {skipped}  |  Dead domains: {dead}")
    return written, skipped
