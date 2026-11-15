from urllib.parse import urlsplit

from django.db import models
from django.db.models import Q


class SeoCallBooking(models.Model):
    """A free 30-minute SEO review, booked on the site and taken by phone.

    Before the call the owner writes the business a prospect report from its website. On the
    call he goes through the report's three main recommendations. ``prospect`` links the
    booking to that report once it exists. Times are stored in UTC and shown in Perth time
    (``seo.utils.call_slots``).
    """

    class Status(models.TextChoices):
        BOOKED = "booked", "Booked"
        DONE = "done", "Call taken"
        NO_SHOW = "no_show", "No answer"
        CANCELLED = "cancelled", "Cancelled"

    starts_at = models.DateTimeField(db_index=True)
    name = models.CharField(max_length=120)
    website = models.URLField()
    phone = models.CharField(max_length=40)
    email = models.EmailField(max_length=150)
    # The optional notes box: anything they want looked at, in their own words.
    notes = models.TextField(blank=True)
    # Where the booking came from, e.g. a page path or "prospect-report", for measuring the call as an offer.
    source = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.BOOKED, db_index=True)
    prospect = models.ForeignKey(
        "seo.SeoProspect", null=True, blank=True, on_delete=models.SET_NULL, related_name="call_bookings",
    )
    # The owner's own notes from the call.
    call_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["starts_at"]
        constraints = [
            # One call at a time: a slot taken by a live booking can't be booked again.
            # A cancelled booking frees its slot.
            models.UniqueConstraint(
                fields=["starts_at"],
                condition=~Q(status="cancelled"),
                name="seo_call_booking_one_live_per_slot",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.site} — {self.starts_at:%Y-%m-%d %H:%M}"

    @property
    def site(self) -> str:
        """The website's host, which names the business since the form doesn't ask for one."""
        return (urlsplit(self.website).hostname or self.website).removeprefix("www.")
