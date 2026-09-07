from django.db import models


class Enquiry(models.Model):
    class HelpWith(models.TextChoices):
        WEBSITE = "website", "Dealer website"
        WEBSITE_BUILDER = "website_builder", "Dealer web enquiry"
        INVENTORY = "inventory", "Inventory, parts, service or hire"
        AUTOMATION = "automation", "Business automation"
        EVERYTHING = "everything", "All of the above"
        UNSURE = "unsure", "Not sure yet"

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        QUALIFIED = "qualified", "Qualified"
        WON = "won", "Won"
        CLOSED = "closed", "Closed"
        SPAM = "spam", "Spam"

    name = models.CharField(max_length=120)
    business = models.CharField(max_length=180, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    website = models.URLField(blank=True)
    help_with = models.CharField(max_length=20, choices=HelpWith.choices)
    message = models.TextField()
    configuration = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "enquiries"

    def __str__(self) -> str:
        return f"{self.business or self.name} — {self.get_help_with_display()}"
