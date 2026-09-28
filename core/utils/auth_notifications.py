"""Telling somebody when a session control fires.

The shared auth app owns the counting and the tokens; it cannot send, because
package apps do not import each other and the wording and recipients are ours
anyway. These are the two callables it is pointed at through `FTP_AUTH`.
"""

from django.conf import settings

from freetheplatform.messaging import send

from core.utils.urls import site_url


def auth_alert(event, user, state, request=None):
    """Tell staff an account is being guessed at, or has locked.

    Sent to staff rather than to the account holder: at five failures the most
    likely explanation is still that they have forgotten their password, and an
    email saying somebody is attacking them would be alarming and usually wrong.
    The package's quiet period is what keeps this from becoming a flood.
    """
    locked = event == "locked"
    subject = (
        f"Account locked — {user.get_username()}"
        if locked
        else f"Repeated failed sign-ins — {user.get_username()}"
    )
    body = (
        f"{'This account is now locked.' if locked else 'Failed sign-ins are adding up.'}\n\n"
        f"Account: {user.get_username()}\n"
        f"Email: {user.email or 'Not supplied'}\n"
        f"Consecutive failures: {state.failure_count}\n"
        f"Locked until: {state.locked_until or 'Not locked'}\n\n"
        "The lock clears itself. Nobody needs to do anything unless this keeps "
        "happening, which would mean somebody is working through passwords."
    )
    return send(
        channel="email",
        to=settings.ADMIN_EMAIL,
        subject=subject,
        body=body,
        message_type="auth.lockout_alert",
    )


def send_password_reset(user, uid, token, request=None):
    """Send the reset link.

    The package supplies the pair and knows nothing about our URLs; building the
    link is the whole reason this hook exists.
    """
    link = f"{site_url()}/reset-password/{uid}/{token}"
    body = (
        f"Hello {user.get_username()},\n\n"
        "Somebody asked to reset the password on your freethedesk account. "
        "Open the link below to choose a new one:\n\n"
        f"{link}\n\n"
        "The link works once and expires within the hour. If you did not ask "
        "for this, you can ignore this email — your password has not changed."
    )
    return send(
        channel="email",
        to=user.email,
        subject="Reset your freethedesk password",
        body=body,
        message_type="auth.password_reset",
    )


def send_password_set(user, actor, request=None):
    """Tell the owner staff set their password. Never the password itself.

    Sent to the account rather than to staff: its owner is the one person who
    would know if they had not asked for this.
    """
    if not user.email:
        return None
    body = (
        f"Hello {user.get_full_name() or user.get_username()},\n\n"
        "freethedesk staff have just set a new password on your account, and "
        "every device that was signed in has been signed out.\n\n"
        "If you asked us to do this, there is nothing else to do. If you did "
        "not, reply to this email straight away."
    )
    return send(
        channel="email",
        to=user.email,
        subject="Your freethedesk password was changed",
        body=body,
        message_type="auth.password_set",
    )
