from datetime import date

import factory

from outreach.models import PodcastProspect


def entry(**overrides) -> dict:
    """One line of the local queue, as `scrape_podcasts` writes it."""
    return {
        "email": "sam@thetradieshow.com.au",
        "email_source": "https://feeds.example.com/tradie-show.rss",
        "podcast_name": "The Tradie Show",
        "host_name": "Sam Lee",
        "website": "https://www.thetradieshow.com.au",
        "apple_url": "https://podcasts.apple.com/au/podcast/the-tradie-show/id1",
        "genre": "Business",
        "episode_count": 42,
        "latest_episode_title": "Quoting jobs without losing money",
        "latest_episode_description": "Mick and Dave on pricing a job so materials don't eat the margin.",
        "last_release_date": "2026-10-20",
        "opener": "Came across your episode on quoting jobs.",
        "scraped_on": "2026-10-25",
        **overrides,
    }


class ProspectFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PodcastProspect

    email = factory.Sequence(lambda n: f"host{n}@example.com")
    email_source = factory.Sequence(lambda n: f"https://feeds.example.com/show-{n}.rss")
    podcast_name = factory.Sequence(lambda n: f"Show {n}")
    host_name = "Sam Lee"
    first_name = "Sam"
    website = "https://www.example.com"
    episode_count = 10
    latest_episode_title = "An episode"
    latest_episode_description = "About something."
    last_release_date = date(2026, 10, 20)
    version = PodcastProspect.Version.A
    scraped_on = date(2026, 10, 25)
