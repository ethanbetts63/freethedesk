from django.core.management.base import BaseCommand

from outreach.utils import scraper


class Command(BaseCommand):
    help = (
        "Searches the iTunes AU store term by term and appends qualifying podcasts to "
        "outreach/data/podcasts.jsonl. Runs locally; `upload_prospects` sends the queue on."
    )

    def add_arguments(self, parser):
        parser.add_argument("--batch", type=int, default=10, help="Entries to write this run (default 10).")

    def handle(self, *args, **options):
        searched_terms = scraper.load_searched_terms()
        searched_feeds = scraper.load_searched_feeds()
        queued_emails = {entry["email"] for entry in scraper.load_queue()}

        if scraper.next_term(searched_terms) is None:
            self.stdout.write(self.style.WARNING(f"All {scraper.TERM_COUNT} terms have been searched."))
            return

        target = options["batch"]
        total_written = total_skipped = empty_in_a_row = 0
        while total_written < target:
            term = scraper.next_term(searched_terms)
            if term is None:
                self.stdout.write(self.style.WARNING("All terms exhausted before the target was reached."))
                break
            written, skipped = scraper.scrape_term(
                term, searched_feeds, queued_emails, self.stdout.write, limit=target - total_written
            )
            searched_terms.append(term)
            total_written += written
            total_skipped += skipped
            empty_in_a_row = empty_in_a_row + 1 if written == 0 and skipped == 0 else 0
            # The cursor is saved after every term, so a cancelled run loses nothing.
            scraper.save_searched_terms(searched_terms)
            scraper.save_searched_feeds(searched_feeds)
            if empty_in_a_row >= 5:
                self.stdout.write(self.style.WARNING("5 consecutive terms returned nothing. Stopping early."))
                break

        self.stdout.write(self.style.SUCCESS(f"\nDone. Written: {total_written} | Skipped: {total_skipped}"))
        self.stdout.write(
            f"Terms searched: {len(searched_terms)}/{scraper.TERM_COUNT} | "
            f"Queue: {len(queued_emails)} | Next term: {scraper.next_term(searched_terms) or 'none'}"
        )
