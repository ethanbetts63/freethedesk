from django.apps import AppConfig


class AffiliatesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "affiliates"

    def ready(self):
        from freetheplatform.messaging import registry

        from . import receivers  # noqa: F401  (a sign-up links the prospect with its address)
        from .models import PodcastProspect

        registry.register_many(
            {
                f"podcast_pitch.{version}": f"Podcast pitch {label}"
                for version, label in PodcastProspect.Version.choices
            }
        )
