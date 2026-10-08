# Enquiry notifications

**Type:** FreeTheDesk configuration and operations runbook.

The public enquiry form saves the enquiry before attempting notifications.
Email and SMS attempts, including failures, remain visible in the dashboard.

Configure the Mailgun and Twilio settings in the local `.env`, including
`ADMIN_EMAIL` and the E.164 `ADMIN_NUMBER`, then explicitly enable delivery:

```dotenv
NOTIFICATIONS_ENABLED=True
```

Keep delivery disabled until the Mailgun sending domain and Twilio messaging
service or sending number are verified. An Australian E.164 number resembles
`+61400111222`.

Shared transport, persistence, retry, and provider behaviour is owned by
FreeThePlatform and documented in
`freetheplatform/_docs/apps/messaging.md`. FreeTheDesk owns enquiry recipients,
message wording, templates, and the domain events that trigger them.

A package order sends two kinds of message (`core/utils/notifications.py`):
`package_order.staff_new`, an email to staff when an order is placed, before it
is paid, so an abandoned checkout can be chased; and `package_order.paid`, an
email and SMS to staff and a receipt email to the customer once Stripe
confirms the payment.
