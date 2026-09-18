from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        # Display names for message-type slugs; an unregistered slug still sends
        # and just shows as itself in the dashboard.
        from freetheplatform.messaging import registry

        registry.register_many(
            {
                "enquiry.admin_new": "Admin - new enquiry",
                "dealer.staff_signup": "Admin - dealer signup",
                "dealer.welcome": "Dealer welcome",
                "seo.staff_signup": "Admin - SEO signup",
                "seo.welcome": "SEO welcome",
                "manual": "Manual email",
            }
        )
