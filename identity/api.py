"""What a screen needs to render the identity block.

Shared by the dealer's sale page and the customer's own Verify step, because
they are the same three images read by two audiences. Kept out of the views so
that `sales` can import it without importing a view, and so the swap to Stripe
Identity changes one function rather than two serializers.
"""

from identity.models import Verification


def verification_for_sale(sale):
    """The sale's verification row, or ``None``.

    The one spelling of this in the codebase. It is a reverse one-to-one, so the
    bare ``getattr(sale, "verification", None)`` it wraps reads as a typo at a
    call site and gets written subtly differently the second time.
    """
    return getattr(sale, "verification", None)


def verification_payload(verification) -> dict:
    """The identity block, or the empty shape when nothing has been sent yet.

    Returns the same keys either way. A screen that has to branch on null before
    it can render a checklist is a screen that renders the checklist twice.
    """
    if verification is None:
        return {
            "status": Verification.Status.PENDING,
            "status_label": "Waiting for the customer",
            "is_verified": False,
            "rejection_reason": "",
            "submitted_at": None,
            "verified_at": None,
            "images": [
                {
                    "side": side,
                    "label": Verification.SIDE_LABELS[side],
                    "status": Verification.ImageStatus.MISSING,
                    "uploaded": False,
                    "reason": "",
                }
                for side in Verification.SIDES
            ],
            "outstanding": [
                f"Send {Verification.SIDE_LABELS[side]}." for side in Verification.SIDES
            ],
        }

    return {
        "status": verification.status,
        "status_label": verification.get_status_display(),
        "is_verified": verification.is_verified,
        "rejection_reason": verification.rejection_reason,
        "submitted_at": verification.submitted_at,
        "verified_at": verification.verified_at,
        "images": [
            {
                "side": side,
                "label": Verification.SIDE_LABELS[side],
                "status": verification.image_status(side),
                "uploaded": bool(verification.image(side)),
                "reason": verification.image_reason(side),
            }
            for side in Verification.SIDES
        ],
        "outstanding": [sentence for _side, sentence in verification.outstanding()],
    }
