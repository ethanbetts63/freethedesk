from django.apps import AppConfig


class OutreachConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "outreach"

    def ready(self):
        from freetheplatform.messaging import registry

        from . import receivers  # noqa: F401  (connects the affiliate sign-up receiver)
        from .utils.pitching import VERSIONS

        registry.register_many(
            {f"podcast_pitch.{version}": f"Podcast pitch {version.upper()}" for version in VERSIONS}
        )
