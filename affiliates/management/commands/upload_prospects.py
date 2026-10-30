from datetime import date

import requests
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from affiliates.models import PodcastProspect
from affiliates.models import PodcastProspect
from affiliates.serializers.prospect_upload import MAX_BATCH
from affiliates.utils import scraper

ACCEPTED = ("created", "already_known", "suppressed")


class Command(BaseCommand):
    help = (
        "Posts affiliates/data/podcasts.jsonl to the server's prospect table in batches. "
        "Lines the server took move to affiliates/data/archive/; lines it refused stay in the queue."
    )

    def add_arguments(self, parser):
        parser.add_argument("--dev", action="store_true", help="Upload to the local Django server instead.")
        parser.add_argument("--count", type=int, default=None, help="Upload at most this many high-fit entries.")

    def handle(self, *args, **options):
        server_url = settings.DEV_API_SERVER_URL if options["dev"] else settings.API_SERVER_URL
        if not server_url:
            raise CommandError("API_SERVER_URL is not set. Put it in .env, or pass --dev.")
        if not settings.INTERNAL_API_KEY:
            raise CommandError("INTERNAL_API_KEY is not set. Put it in .env; the server holds the same value.")

        queue = scraper.load_queue()
        if not queue:
            self.stdout.write(self.style.WARNING("The queue is empty."))
            return
        # Only a show rated high fit is uploaded (owner, 2026-10-30; the server pitches no other). Medium
        # and low go to the archive unsent, opener and all, in case the rule changes; an unrated entry
        # has not been looked at yet and stays in the queue.
        rated = lambda entry: entry.get("relevance", "")  # noqa: E731
        fit = [entry for entry in queue if rated(entry) == PodcastProspect.Relevance.HIGH]
        set_aside = [entry for entry in queue if rated(entry) and rated(entry) != PodcastProspect.Relevance.HIGH]
        unrated = [entry for entry in queue if not rated(entry)]
        if set_aside:
            scraper.append_entries(set_aside, scraper.ARCHIVE_DIR / f"{date.today().isoformat()}-set-aside.jsonl")
            self.stdout.write(f"{len(set_aside)} set aside as not high fit, archived unsent.")
        if unrated:
            self.stdout.write(f"{len(unrated)} unrated entries stay in the queue.")
        if not fit:
            scraper.save_queue(unrated)
            self.stdout.write(self.style.WARNING("Nothing rated high fit to upload."))
            return
        to_send = fit if options["count"] is None else fit[: options["count"]]
        remaining = fit[len(to_send):] + unrated

        url = f"{server_url.rstrip('/')}/api/outreach/upload/"
        headers = {"X-Internal-API-Key": settings.INTERNAL_API_KEY}
        self.stdout.write(f"{len(queue)} in the queue. Uploading {len(to_send)} to {url}")

        counts = {"created": 0, "already_known": 0, "suppressed": 0, "invalid": 0}
        archived, kept = [], []
        for start in range(0, len(to_send), MAX_BATCH):
            chunk = to_send[start:start + MAX_BATCH]
            try:
                response = requests.post(url, json={"entries": chunk}, headers=headers, timeout=60)
                response.raise_for_status()
                body = response.json()
            except (requests.RequestException, ValueError) as error:
                # The whole chunk stays queued; the ones before it are already archived.
                self.stderr.write(self.style.ERROR(f"Batch from {start} failed: {error}"))
                kept.extend(chunk)
                continue
            for entry, result in zip(chunk, body["results"]):
                outcome = result["outcome"]
                counts[outcome] = counts.get(outcome, 0) + 1
                if outcome in ACCEPTED:
                    archived.append(entry)
                else:
                    kept.append(entry)
                    self.stdout.write(self.style.WARNING(f"  invalid {entry.get('email', '?')}: {result.get('errors')}"))

        if archived:
            scraper.append_entries(archived, scraper.ARCHIVE_DIR / f"{date.today().isoformat()}.jsonl")
        scraper.save_queue(kept + remaining)
        self.stdout.write(self.style.SUCCESS(
            f"\nDone. Created: {counts['created']} | Already known: {counts['already_known']} | "
            f"Suppressed: {counts['suppressed']} | Invalid: {counts['invalid']} | Left in queue: {len(kept) + len(remaining)}"
        ))
