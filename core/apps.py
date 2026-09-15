from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        # Display names for the message-type slugs used across the site. The
        # slugs themselves are free text, so this only affects how a row reads in
        # the dashboard; an unregistered slug still sends and shows as itself.
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
