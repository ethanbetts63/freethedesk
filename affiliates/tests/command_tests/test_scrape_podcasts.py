from io import StringIO

import pytest
from django.core.management import call_command

from affiliates.utils import scraper


@pytest.fixture
def data_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(scraper, "QUEUE_PATH", tmp_path / "podcasts.jsonl")
    monkeypatch.setattr(scraper, "TERMS_PATH", tmp_path / "searched_terms.json")
    monkeypatch.setattr(scraper, "FEEDS_PATH", tmp_path / "searched_feeds.json")
    return tmp_path


def fake_scrape(found_per_term):
    searched = []

    def scrape_term(term, searched_feeds, queued_emails, write, limit=None, pause=0.4):
        searched.append((term, limit))
        searched_feeds.add(f"https://feeds.example.com/{term}.rss")
        n = min(found_per_term, limit if limit is not None else found_per_term)
        for i in range(n):
            queued_emails.add(f"{term}{i}@example.com")
        return n, 1

    return scrape_term, searched


def run(*args):
    out = StringIO()
    call_command("scrape_podcasts", *args, stdout=out, stderr=out)
    return out.getvalue()


def test_the_walk_takes_the_next_alphabet_terms_and_moves_the_cursor(data_dir, monkeypatch):
    scraper.save_searched_terms(["aa", "ab"])
    scrape_term, searched = fake_scrape(2)
    monkeypatch.setattr(scraper, "scrape_term", scrape_term)

    output = run("--batch", "3")

    assert [term for term, _ in searched] == ["ac", "ad"]
    assert scraper.load_searched_terms() == ["aa", "ab", "ac", "ad"]
    assert "Written: 3" in output


def test_given_terms_are_searched_instead_and_the_cursor_stays_put(data_dir, monkeypatch):
    scraper.save_searched_terms(["aa", "ab"])
    scrape_term, searched = fake_scrape(2)
    monkeypatch.setattr(scraper, "scrape_term", scrape_term)

    output = run("--batch", "3", "--terms", "small business", "tradie", "marketing agency")

    # Two terms reach the batch of three; the third is never searched.
    assert searched == [("small business", 3), ("tradie", 1)]
    assert scraper.load_searched_terms() == ["aa", "ab"]
    # Feeds tried by a word are recorded, so the walk never tries them again.
    assert "https://feeds.example.com/tradie.rss" in scraper.load_searched_feeds()
    assert "Written: 3" in output
