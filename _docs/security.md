# Security

This project follows the established Allbikes security boundary: Next.js serves
the browser application, browser API calls stay on the same origin through the
Next rewrite, and Django remains authoritative for identity, permissions,
validation, pricing and payment state.

## Browser and transport

Next.js sends `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a
strict-origin referrer policy and a restrictive permissions policy. Production
Django trusts one configured HTTPS proxy, enables secure session and CSRF
cookies, and sends two-year HSTS including subdomains. The hosting layer is
responsible for redirecting HTTP to HTTPS.

All `/api/` responses receive `Cache-Control: no-store, private`.

## Authentication and CSRF

JWT access and rotating refresh tokens live in HttpOnly cookies. Authenticated
unsafe requests must pass Django's CSRF check. APIs default to authenticated;
public APIs explicitly opt into `AllowAny`. Anonymous and authenticated requests
are globally throttled, with a separate five-per-minute login limit.

`NUM_PROXIES=1` means the deployed proxy chain must contain exactly one trusted
proxy. Client IP recording uses that same rule instead of trusting the first
caller-supplied `X-Forwarded-For` value.

## Dealer documents

Dealer licence and identity documents live outside public media storage and do
not have public URLs. Upload type is detected from file bytes, the image or PDF
is fully parsed with bounded pixel/page counts, and the stored extension comes
from the verified type. The application returns only an uploaded/not-uploaded
flag to dealer clients.

The production host must also enforce a request-body ceiling, restrict filesystem
access to the application account, encrypt disks/backups, and include the private
document tree in the retention and deletion process.

## Payments

The frontend never supplies a trusted price. Django reads the current
GST-inclusive price from `LicensingSettings`, snapshots the offer and exact terms
acceptance, and sends the amount to Stripe as inclusive recurring price data.
Webhook signatures are verified and every Stripe event ID is persisted, making
replay idempotent. Subscription status comes only from subscription events;
invoice events cannot regress it.

## Production secrets

Production startup fails if `SECRET_KEY`, `STRIPE_SECRET_KEY` or
`STRIPE_WEBHOOK_SECRET` is missing. Secrets belong in deployment environment
variables and must never be committed.
