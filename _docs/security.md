# Security

Next.js serves the browser application, browser API calls stay on the same
origin through the Next rewrite, and Django remains authoritative for
identity, permissions, validation, pricing and payment state.

Shared baseline — CSP/HSTS/transport headers, the JWT-cookie/CSRF pattern,
the role/portal contract, and edge route protection — is documented once in
[`../freetheplatform/_docs/security-standard.md`](../../freetheplatform/_docs/security-standard.md).
This file covers only what's specific to freethedesk.

## Browser and transport

Production Django trusts one configured HTTPS proxy and sends its own HSTS
header including subdomains; Next's own HSTS header is documented centrally.
The hosting layer is responsible for redirecting HTTP to HTTPS.

All `/api/` responses receive `Cache-Control: no-store, private`.

## Authentication and CSRF

JWT-in-HttpOnly-cookie and the CSRF pattern are shared (`security-standard.md`);
freethedesk's cookie names are `freethedesk_access` / `freethedesk_refresh`
(`config/settings.py`). APIs default to authenticated; public APIs explicitly
opt into `AllowAny`. Anonymous and authenticated requests are globally
throttled, with a separate five-per-minute login limit.

`NUM_PROXIES=1` means the deployed proxy chain must contain exactly one trusted
proxy. Client IP recording uses that same rule instead of trusting the first
caller-supplied `X-Forwarded-For` value.

Staff passwords require twelve characters, not Django's default eight. Validators
run only when a password is set, so this binds new accounts and future changes;
accounts created before 2026-09-18 are unchanged and cannot be audited, because
they are hashed.

### Refresh tokens can be revoked

A JWT is trusted because its signature verifies, not because a row exists, so
nothing server-side can withdraw one unless it has been recorded as withdrawn.
`rest_framework_simplejwt.token_blacklist` is installed and two things use it:
`BLACKLIST_AFTER_ROTATION`, so the token a refresh replaced stops working and a
replayed one is a theft signal; and `LogoutView`, which blacklists the refresh
cookie before clearing it. Logout still returns 200 for a missing, malformed or
already-blacklisted token — refusing it would leave open the session the caller
asked to close. `REFRESH_TOKEN_LIFETIME` is 7 days, flat for all roles.

The **access** token stays unrevocable by design, so a copied one works until it
expires, up to 60 minutes. Revocation bounds an incident to that hour rather than
to seven days; it does not end one instantly.

Blacklist rows are pruned opportunistically on a successful login
(`core/utils/token_cleanup.py`): a bounded batch, at most once a day, wrapped so
it can never fail a login. There is no scheduler here we control, and a cron job
that quietly stops running would let the table grow with nobody being told.

### Known gaps

- Django's admin is routed in production and its login is not throttled, because
  it is not a DRF view. `SessionAuthentication` is also in the default
  authentication classes, so a session obtained there authenticates the whole API.
- `seo/set-password/` does not ask for the current password, is not throttled, and
  does not revoke other sessions.
- There is no password reset flow, no second factor, and no alerting on repeated
  authentication failure.
- No `CACHES` block is declared, so throttle counters live in Django's implicit
  per-process local memory: multiplied by the worker count, and reset by any
  restart.

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
GST-inclusive price from `SiteSettings`, snapshots the offer and exact terms
acceptance, and sends the amount to Stripe as inclusive recurring price data.
Webhook signatures are verified and every Stripe event ID is persisted, making
replay idempotent. Subscription status comes only from subscription events;
invoice events cannot regress it.

## Production secrets

Production startup fails if `SECRET_KEY`, `STRIPE_SECRET_KEY` or
`STRIPE_WEBHOOK_SECRET` is missing. Secrets belong in deployment environment
variables and must never be committed.
