from datetime import datetime, timedelta, timezone

from affiliates.utils import scraper
from affiliates.utils.names import first_name

FEED = """<?xml version="1.0"?>
<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>The Tradie Show</title>
    <link>https://www.thetradieshow.com.au</link>
    <language>en-au</language>
    <itunes:owner><itunes:name>Sam Lee</itunes:name><itunes:email>Sam@TheTradieShow.com.au</itunes:email></itunes:owner>
    <item>
      <title>Quoting jobs</title>
      <description><![CDATA[<p>Mick &amp; Dave on <b>pricing</b> a job.</p>  <p>And materials.</p>]]></description>
    </item>
    <item><title>Older</title><description>Old.</description></item>
  </channel>
</rss>"""


def test_parse_rss_reads_the_owner_and_the_latest_episode():
    rss = scraper.parse_rss_text(FEED.encode())

    assert rss == {
        "host_name": "Sam Lee",
        "email": "Sam@TheTradieShow.com.au",
        "website": "https://www.thetradieshow.com.au",
        "latest_episode_title": "Quoting jobs",
        "latest_episode_description": "Mick & Dave on pricing a job. And materials.",
    }
    assert scraper.has_required_fields(rss)


def test_parse_rss_drops_feeds_that_are_not_english_or_not_feeds():
    assert scraper.parse_rss_text(FEED.replace("en-au", "de").encode()) is None
    assert scraper.parse_rss_text(b"not xml") is None
    assert scraper.parse_rss_text(b"<rss><channel></channel></rss>") is None


def test_itunes_filters_keep_small_recent_shows_with_a_feed():
    recent = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat().replace("+00:00", "Z")
    stale = (datetime.now(timezone.utc) - timedelta(days=90)).isoformat().replace("+00:00", "Z")
    base = {"trackCount": 40, "releaseDate": recent, "feedUrl": "https://feeds.example.com/a.rss"}

    assert scraper.passes_itunes_filters(base)
    assert not scraper.passes_itunes_filters({**base, "trackCount": 101})
    assert not scraper.passes_itunes_filters({**base, "releaseDate": stale})
    assert not scraper.passes_itunes_filters({**base, "feedUrl": ""})
    assert not scraper.passes_itunes_filters({**base, "releaseDate": "garbage"})


def test_a_bare_domain_site_gets_a_scheme():
    # Three of the first 302 uploads were refused for `website` values like this.
    rss = scraper.parse_rss_text(FEED.replace("https://www.thetradieshow.com.au", "www.thetradieshow.com.au").encode())
    assert rss["website"] == "https://www.thetradieshow.com.au"
    assert scraper.parse_rss_text(FEED.encode())["website"] == "https://www.thetradieshow.com.au"


def test_build_entry_lowercases_the_address_and_leaves_the_opener_blank():
    rss = scraper.parse_rss_text(FEED.encode())
    result = {
        "collectionName": " The Tradie Show ",
        "collectionViewUrl": "https://podcasts.apple.com/au/podcast/id1",
        "primaryGenreName": "Business",
        "trackCount": 42,
        "releaseDate": "2026-10-20T06:00:00Z",
    }

    built = scraper.build_entry(result, rss, "https://feeds.example.com/a.rss")

    assert built["email"] == "sam@thetradieshow.com.au"
    assert built["email_source"] == "https://feeds.example.com/a.rss"
    assert built["podcast_name"] == "The Tradie Show"
    assert built["last_release_date"] == "2026-10-20"
    assert built["opener"] == ""
    assert built["relevance"] == ""
    assert "subject" not in built
    assert scraper.urls_fit(built)
    assert not scraper.urls_fit({**built, "website": "https://x.example/" + "a" * 500})


def test_next_term_walks_the_alphabet():
    assert scraper.next_term([]) == "aa"
    assert scraper.next_term(["aa", "ab"]) == "ac"
    assert scraper.next_term(list(scraper.all_terms())) is None


def test_first_name_only_from_a_persons_name():
    assert first_name("Sam Lee") == "Sam"
    assert first_name("sam lee") == "Sam"
    assert first_name("Dr. Priya Nair") == "Dr"  # a title is still how they'd be addressed
    assert first_name("The Tradie Show") == ""
    assert first_name("Tradie Show Team") == ""
    assert first_name("ABC Radio") == ""
    assert first_name("sam@thetradieshow.com.au") == ""
    assert first_name("") == ""
    assert first_name("Mick Dave Steve Jo") == ""
