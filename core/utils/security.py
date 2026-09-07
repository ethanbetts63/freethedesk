from django.conf import settings


def client_ip(request):
    """Return the client address using the explicitly configured proxy depth."""

    remote = (request.META.get("REMOTE_ADDR") or "").strip()
    forwarded = [
        part.strip()
        for part in request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")
        if part.strip()
    ]
    proxy_count = settings.REST_FRAMEWORK.get("NUM_PROXIES", 0)
    if proxy_count and len(forwarded) >= proxy_count:
        return forwarded[-proxy_count]
    return remote or None
