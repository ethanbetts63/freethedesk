from datetime import time

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

WEEKDAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")


class SeoCallSettings(models.Model):
    """Singleton: when the free SEO review call can be booked. Editable in the dashboard's call settings.

    The times are deliberately separate from the business's opening hours. A call is offered every
    half hour from ``start_time``, with the last one ending by ``end_time``, on each ticked day, and never
    sooner than ``booking_advance_notice`` days ahead. That notice gives the owner time to write the
    business's prospect report before the call.
    """

    booking_advance_notice = models.PositiveSmallIntegerField(
        default=3,
        validators=[MaxValueValidator(60)],
        help_text="Days we're always booked out ahead: the soonest a call can be booked.",
    )
    start_time = models.TimeField(default=time(9, 0), help_text="The first call of the day starts at this time.")
    end_time = models.TimeField(default=time(17, 0), help_text="The last call of the day ends by this time.")
    monday = models.BooleanField(default=True)
    tuesday = models.BooleanField(default=True)
    wednesday = models.BooleanField(default=True)
    thursday = models.BooleanField(default=True)
    friday = models.BooleanField(default=True)
    saturday = models.BooleanField(default=False)
    sunday = models.BooleanField(default=False)
    # How far ahead the booking form looks, after the notice.
    weeks_shown = models.PositiveSmallIntegerField(default=2, validators=[MinValueValidator(1), MaxValueValidator(12)])

    class Meta:
        verbose_name = "SEO call settings"
        verbose_name_plural = "SEO call settings"

    def __str__(self) -> str:
        return "SEO call settings"

    @classmethod
    def load(cls) -> "SeoCallSettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def open_weekdays(self) -> set[int]:
        """The ticked days as Python weekday numbers, where Monday is 0."""
        return {index for index, name in enumerate(WEEKDAYS) if getattr(self, name)}
