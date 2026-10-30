import json
from io import StringIO

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError

from affiliates.management.commands import upload_prospects as command
from affiliates.tests.factories import entry
from affiliates.utils import scraper


class FakeResponse:
    def __init__(self, results):
        self._results = results

    def raise_for_status(self):
        pass

    def json(self):
        return {"results": self._results}


@pytest.fixture
def data_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(scraper, "QUEUE_PATH", tmp_path / "podcasts.jsonl")
    monkeypatch.setattr(scraper, "ARCHIVE_DIR", tmp_path / "archive")
    return tmp_path


def run(*args):
    out = StringIO()
    call_command("upload_prospects", *args, stdout=out, stderr=out)
    return out.getvalue()


def test_accepted_lines_are_archived_and_refused_lines_stay(data_dir, monkeypatch, settings, internal_key):
    settings.API_SERVER_URL = "https://www.freethedesk.com.au"
    queue = [entry(email="a@example.com"), entry(email="b@example.com"), entry(email="bad"), entry(email="c@example.com")]
    scraper.save_queue(queue)
    calls = []

    def fake_post(url, json=None, headers=None, timeout=None):
        calls.append((url, headers, json))
        outcomes = {"a@example.com": "created", "b@example.com": "already_known", "bad": "invalid", "c@example.com": "suppressed"}
        return FakeResponse([{"email": e["email"], "outcome": outcomes[e["email"]]} for e in json["entries"]])

    monkeypatch.setattr(command.requests, "post", fake_post)

    output = run()

    assert calls[0][0] == "https://www.freethedesk.com.au/api/outreach/upload/"
    assert calls[0][1] == {"X-Internal-API-Key": internal_key}
    assert "Created: 1 | Already known: 1 | Suppressed: 1 | Invalid: 1 | Left in queue: 1" in output
    assert [e["email"] for e in scraper.load_queue()] == ["bad"]
    archived = list((data_dir / "archive").glob("*.jsonl"))
    assert len(archived) == 1
    assert [json.loads(line)["email"] for line in archived[0].read_text(encoding="utf-8").splitlines()] == [
        "a@example.com", "b@example.com", "c@example.com",
    ]


def test_only_high_fit_entries_are_uploaded_and_the_rest_are_set_aside_or_kept(data_dir, monkeypatch, settings, internal_key):
    settings.API_SERVER_URL = "https://www.freethedesk.com.au"
    scraper.save_queue([
        entry(email="high@example.com", relevance="high"),
        entry(email="medium@example.com", relevance="medium"),
        entry(email="low@example.com", relevance="low"),
        entry(email="unrated@example.com", relevance=""),
    ])
    posted = []

    def fake_post(url, json=None, headers=None, timeout=None):
        posted.extend(e["email"] for e in json["entries"])
        return FakeResponse([{"email": e["email"], "outcome": "created"} for e in json["entries"]])

    monkeypatch.setattr(command.requests, "post", fake_post)

    output = run()

    assert posted == ["high@example.com"]
    assert "2 set aside as not high fit, archived unsent." in output
    assert "1 unrated entries stay in the queue." in output
    assert [e["email"] for e in scraper.load_queue()] == ["unrated@example.com"]
    set_aside = next((data_dir / "archive").glob("*-set-aside.jsonl"))
    assert [json.loads(line)["email"] for line in set_aside.read_text(encoding="utf-8").splitlines()] == [
        "medium@example.com", "low@example.com",
    ]


def test_dev_targets_the_local_server_and_count_limits_the_run(data_dir, monkeypatch, settings, internal_key):
    settings.API_SERVER_URL = ""
    scraper.save_queue([entry(email="a@example.com"), entry(email="b@example.com")])
    calls = []

    def fake_post(url, json=None, headers=None, timeout=None):
        calls.append(url)
        return FakeResponse([{"email": e["email"], "outcome": "created"} for e in json["entries"]])

    monkeypatch.setattr(command.requests, "post", fake_post)

    run("--dev", "--count", "1")

    assert calls == [f"{settings.DEV_API_SERVER_URL}/api/outreach/upload/"]
    assert [e["email"] for e in scraper.load_queue()] == ["b@example.com"]


def test_a_failed_batch_stays_queued(data_dir, monkeypatch, settings, internal_key):
    settings.API_SERVER_URL = "https://www.freethedesk.com.au"
    scraper.save_queue([entry(email="a@example.com")])

    def failing_post(url, json=None, headers=None, timeout=None):
        raise command.requests.ConnectionError("down")

    monkeypatch.setattr(command.requests, "post", failing_post)

    output = run()

    assert "failed" in output
    assert [e["email"] for e in scraper.load_queue()] == ["a@example.com"]


def test_missing_configuration_is_a_clear_error(data_dir, settings):
    settings.API_SERVER_URL = ""
    settings.INTERNAL_API_KEY = "x"
    scraper.save_queue([entry()])
    with pytest.raises(CommandError, match="API_SERVER_URL"):
        run()
    settings.INTERNAL_API_KEY = ""
    with pytest.raises(CommandError, match="INTERNAL_API_KEY"):
        run("--dev")
