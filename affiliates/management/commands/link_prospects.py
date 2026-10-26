from django.core.management.base import BaseCommand

from affiliates.receivers import link_prospects_to_affiliates


class Command(BaseCommand):
    help = (
        "Points every unlinked prospect at the affiliate who registered with its address. "
        "Sign-ups do this themselves; this is for accounts that existed before the prospect was uploaded."
    )

    def handle(self, *args, **options):
        self.stdout.write(f"{link_prospects_to_affiliates()} linked.")
