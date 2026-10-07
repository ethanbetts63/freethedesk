# Invoicing

**Type:** reference for freethedesk's use of `freetheplatform.invoicing`. The
rules (drafts, numbering, issuing, voiding, the PDF, the API) are the package's:
[`../../freetheplatform/_docs/apps/invoicing.md`](../../freetheplatform/_docs/apps/invoicing.md).

## No GST, anywhere

The business is not registered for GST
([stripe-subscriptions.md](stripe-subscriptions.md)), so
`FTP_INVOICING["TAX_REGISTERED"]` is `False`. The PDF is titled "Invoice", not
"Tax Invoice", and prints no tax row or tax note. The API forces every line
untaxed, and the dashboard editor has no tax controls. Registering for GST
later means turning that setting on and adding the controls back.

## What is ours

| Piece              | Where                                                | Notes                                                                                                                           |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Seller and bank    | `core/models/invoice_settings.py`                    | Staff-edited at `/dashboard/admin/settings/invoicing`. Kept apart from `SiteSettings`, which the public prices endpoint serves. |
| Logo and colour    | `frontend/public/logo-mark.png`, `#2473c6`           | The mark, with the business name printed beside it; the blue is `--blue-600`.                                                   |
| Sending            | `core/invoicing.py` `send_invoice`                   | Through `freetheplatform.messaging`, related to the invoice, message type `invoice`.                                            |
| Prefill and search | `core/invoicing.py`                                  | Enquiries, dealers and SEO customers.                                                                                           |
| Staff API          | `api/admin/invoices/`, `api/admin/invoice-settings/` |                                                                                                                                 |
| Dashboard          | `/dashboard/admin/invoices`                          | List, editor, detail, email. **Create invoice** on an enquiry, dealer or SEO customer opens the editor filled in.               |

The bank details start blank. Until they are filled in, an invoice prints no
"How to pay" box.
