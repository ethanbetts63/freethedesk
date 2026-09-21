"""The provider interface, and the manual provider behind it.

One interface with one implementation is usually a smell. Here it is the point:
this whole app is built to be deleted, and the interface is the line the deletion
stops at. The manual fields, the review actions and the
``awaiting_identity_review`` state all go with the swap; what survives is
``Verification.is_verified`` and the four functions below, which a Stripe
provider implements by returning a verdict instead of asking a person for one.

Everything that moves the sale lives here rather than in a view, because the
same transitions are reached from two different sides of the product — the
customer submitting and the dealer reviewing — and a rule written twice is a
rule that eventually differs.
"""

from django.db import transaction
from django.utils import timezone

from identity.models import Verification
from sales.models import Sale
from sales.transitions import InvalidTransition, record, transition


class IdentityError(Exception):
    """The action does not make sense for the state the verification is in."""


def verification_for(sale) -> Verification:
    """The sale's verification, created on first use.

    Created lazily rather than with the sale: a sale that never reaches a
    customer should not leave a row implying somebody was asked for their
    licence.

    ``get_or_create_for`` rather than a read and a create. The customer picks
    three files on a phone, and two uploads arriving together against a sale
    with no row yet would both insert against a ``OneToOneField`` — the second
    one a 500, at the least forgiving moment in the flow.
    """
    verification, _ = Verification.objects.get_or_create_for(sale.dealer, sale=sale)
    return verification


def _locked(verification) -> Verification:
    """Re-read the row with ``SELECT … FOR UPDATE`` held for this transaction.

    Every function below is a read-modify-write of one row that two people can
    reach at once: the customer replacing a photograph while the dealer is
    reviewing the one beside it. Without the lock the second write overwrites
    the first's ``status`` from a value it read before the first ran, and the
    losing verdict vanishes with no error anywhere.

    A re-read rather than a lock taken by the caller, because the caller has a
    plain instance and the lock has to be taken inside the transaction that
    does the writing. One extra query on a path that is already writing.
    """
    return Verification.all_objects.select_related("sale").select_for_update().get(
        pk=verification.pk
    )


@transaction.atomic
def store_image(verification, side, upload, *, actor_label="", ip_address=None, user_agent=""):
    """Accept one image and mark it as waiting for review.

    Replacing an image clears the reason the last one was rejected for. Leaving
    it would show the customer an explanation of a photograph they have already
    replaced.
    """
    if side not in Verification.SIDES:
        raise IdentityError(f"{side!r} is not one of the images this asks for.")
    verification = _locked(verification)
    if verification.status == Verification.Status.VERIFIED:
        raise IdentityError("This identity check is already complete.")

    existing = verification.image(side)
    if existing:
        existing.delete(save=False)

    setattr(verification, f"{side}_image", upload)
    setattr(verification, f"{side}_status", Verification.ImageStatus.SUBMITTED)
    setattr(verification, f"{side}_reason", "")
    # A new image on a rejected check reopens it. The customer is acting on the
    # rejection, and leaving the overall status at `rejected` would tell them
    # their answer was ignored.
    if verification.status == Verification.Status.REJECTED:
        verification.status = Verification.Status.PENDING
        verification.rejection_reason = ""
    verification.save(
        update_fields=[
            f"{side}_image", f"{side}_status", f"{side}_reason",
            "status", "rejection_reason", "updated_at",
        ]
    )
    record(
        verification.sale,
        "identity.uploaded",
        actor_label=actor_label,
        ip_address=ip_address,
        user_agent=user_agent,
        side=side,
    )
    return verification


@transaction.atomic
def submit(verification, *, actor_label="", ip_address=None, user_agent=""):
    """Hand the images to the dealer to look at.

    Moves the sale to ``awaiting_identity_review``, which exists only while
    identity is manual — Stripe Identity returns a verdict without a human, so
    that state disappears with the swap. Which is why it is a state rather than
    a flag on the one before it.
    """
    verification = _locked(verification)
    if not verification.all_submitted():
        raise IdentityError("Send all three photos before submitting them.")

    verification.status = Verification.Status.SUBMITTED
    verification.submitted_at = timezone.now()
    verification.rejection_reason = ""
    verification.save(update_fields=["status", "submitted_at", "rejection_reason", "updated_at"])

    sale = verification.sale
    if sale.status == Sale.Status.AWAITING_CUSTOMER:
        transition(
            sale,
            Sale.Status.AWAITING_IDENTITY_REVIEW,
            actor_label=actor_label,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    else:
        record(
            sale,
            "identity.submitted",
            actor_label=actor_label,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    return verification


@transaction.atomic
def review(verification, side, *, approved, reason="", user=None, ip_address=None, user_agent=""):
    """Approve or reject one image.

    Rejecting **clears that image and keeps the others**. The customer is asked
    for the one that could not be read, with the dealer's own sentence attached,
    and the file itself is deleted rather than kept beside its replacement — an
    unusable photograph of a driver's licence is still a photograph of a
    driver's licence.

    The gate opens only when all three are approved, and it is this function
    that opens it. Nothing else sets ``VERIFIED``.
    """
    if side not in Verification.SIDES:
        raise IdentityError(f"{side!r} is not one of the images this asks for.")
    verification = _locked(verification)
    if not verification.image(side):
        raise IdentityError("There is nothing to review for that image yet.")

    fields = [f"{side}_status", f"{side}_reason", "status", "updated_at"]
    if approved:
        setattr(verification, f"{side}_status", Verification.ImageStatus.APPROVED)
        setattr(verification, f"{side}_reason", "")
    else:
        if not reason.strip():
            raise IdentityError("Say why, in a sentence the customer will read.")
        verification.image(side).delete(save=False)
        setattr(verification, f"{side}_image", "")
        setattr(verification, f"{side}_status", Verification.ImageStatus.REJECTED)
        setattr(verification, f"{side}_reason", reason.strip())
        fields.append(f"{side}_image")

    sale = verification.sale
    actor_label = user.get_username() if user else ""

    if approved and verification.all_approved():
        verification.status = Verification.Status.VERIFIED
        verification.verified_at = timezone.now()
        verification.verified_by = user
        verification.rejection_reason = ""
        fields += ["verified_at", "verified_by", "rejection_reason"]
    elif not approved:
        verification.status = Verification.Status.REJECTED
        verification.rejection_reason = reason.strip()
        fields.append("rejection_reason")
    else:
        verification.status = Verification.Status.SUBMITTED

    verification.save(update_fields=list(dict.fromkeys(fields)))

    record(
        sale,
        "identity.approved" if approved else "identity.rejected",
        actor=user,
        actor_label=actor_label,
        ip_address=ip_address,
        user_agent=user_agent,
        side=side,
        reason=reason.strip() if not approved else "",
    )

    _move_sale(sale, verification, actor=user, actor_label=actor_label,
               ip_address=ip_address, user_agent=user_agent)
    return verification


def _move_sale(sale, verification, **event):
    """Put the sale where the verdict says it belongs.

    Swallows an invalid transition rather than raising. A sale that has moved on
    since the dealer opened the page — cancelled, or already signed — should not
    have a review of one photograph blow up in their face, and the verdict on
    the image is recorded either way.
    """
    if verification.is_verified:
        target = Sale.Status.READY_TO_SIGN
    elif verification.status == Verification.Status.REJECTED:
        target = Sale.Status.AWAITING_CUSTOMER
    else:
        return
    try:
        transition(sale, target, **event)
    except InvalidTransition:
        return
