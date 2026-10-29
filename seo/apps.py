from django.apps import AppConfig


class SeoConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "seo"

    def ready(self):
        from freetheplatform.messaging import registry

        from .models import SeoProspect

        registry.register_many(
            {f"seo_prospect.{value}": f"Prospect report, subject {value}" for value in SeoProspect.Subject.values}
        )
        # Not under "seo_prospect.": the calls list reads that prefix as the report email's status.
        registry.register_many({"seo_followup": "Note to a prospect after a call, written by hand"})
