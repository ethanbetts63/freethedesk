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
