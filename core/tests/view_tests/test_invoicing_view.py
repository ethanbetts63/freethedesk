"""freethedesk's wiring of `freetheplatform.invoicing`: the invoice settings as the seller, no GST
anywhere, messaging as the sender, and our enquiries as customers. The invoice rules themselves are
the package's and are tested there."""

import io

import pytest
from pypdf import PdfReader

from core.models import InvoiceSettings
from core.tests.factories import EnquiryFactory

pytestmark = pytest.mark.django_db

URL = "/api/admin/invoices/"


@pytest.fixture
def staff_client(api_client, staff_user):
    api_client.force_authenticate(staff_user)
    return api_client


def create(client, **overrides):
    payload = {
        "customer_name": "Jordan Smith",
        "customer_email": "jordan@example.com",
        "lines": [{"description": "Website build", "quantity": "1", "unit_price": "2500.00"}],
        **overrides,
    }
    response = client.post(URL, payload, format="json")
    assert response.status_code == 201, response.json()
    return response.json()


def pdf_text(content):
    return "\n".join(page.extract_text() for page in PdfReader(io.BytesIO(content)).pages)


def test_invoice_settings_are_staff_only_and_not_on_the_public_endpoint(api_client):
    assert api_client.get("/api/admin/invoice-settings/").status_code == 401
    assert "bank_account_number" not in api_client.get("/api/site-settings/").json()


def test_staff_set_the_bank_details_the_invoice_prints(staff_client):
    response = staff_client.patch(
        "/api/admin/invoice-settings/",
        {"bank_account_name": "Free The Desk", "bank_bsb": "036-004", "bank_account_number": "123456"},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["bank_bsb"] == "036004"

    invoice = create(staff_client)
    staff_client.post(f"{URL}{invoice['id']}/issue/")
    text = pdf_text(staff_client.get(f"{URL}{invoice['id']}/pdf/").content)
    for expected in ("Invoice", "INV-1001", "freethedesk", "ABN 11 493 753 896", "036-004", "123456", "$2,500.00"):
        assert expected in text, expected


def test_a_bsb_must_be_six_digits(staff_client):
    response = staff_client.patch("/api/admin/invoice-settings/", {"bank_bsb": "12345"}, format="json")
    assert response.status_code == 400


def test_no_invoice_mentions_gst(staff_client):
    config = staff_client.get(f"{URL}config/").json()
    assert (config["tax_registered"], config["tax_name"]) == (False, "")

    invoice = create(staff_client)
    assert invoice["tax_total"] == "0.00"
    staff_client.post(f"{URL}{invoice['id']}/issue/")
    text = pdf_text(staff_client.get(f"{URL}{invoice['id']}/pdf/").content)
    assert "GST" not in text and "Tax Invoice" not in text
    assert "GST" not in staff_client.get(f"{URL}{invoice['id']}/email/").json()["body"]


def test_an_enquiry_prefills_the_customer(staff_client):
    enquiry = EnquiryFactory(name="Sam Owner", business="Owner Motors", email="sam@owner.example")
    body = staff_client.get(f"{URL}prefill/", {"related_type": "core.enquiry", "related_id": enquiry.pk}).json()
    assert body["customer"]["customer_company"] == "Owner Motors"
    assert body["customer"]["customer_email"] == "sam@owner.example"
    assert body["related"]["type"] == "core.enquiry"


def test_customer_search_finds_enquiries(staff_client):
    enquiry = EnquiryFactory(business="Findable Pty Ltd")
    results = staff_client.get(f"{URL}customers/", {"search": "findable"}).json()["results"]
    assert [(result["source"], result["related"]["id"]) for result in results] == [("Enquiry", enquiry.pk)]


def test_emailing_goes_through_messaging_related_to_the_invoice(staff_client, outbox):
    invoice = create(staff_client)
    staff_client.post(f"{URL}{invoice['id']}/issue/")
    draft = staff_client.get(f"{URL}{invoice['id']}/email/").json()
    assert draft["subject"] == "Invoice INV-1001 from freethedesk"
    response = staff_client.post(
        f"{URL}{invoice['id']}/email/",
        {"to": draft["to"], "subject": draft["subject"], "body": draft["body"]},
        format="multipart",
    )
    assert response.status_code == 201, response.json()
    [message] = outbox
    assert (message.to, message.message_type) == ("jordan@example.com", "invoice")
    assert message.content_object.pk == invoice["id"]
    assert InvoiceSettings.load().business_name == "freethedesk"


def test_a_fresh_install_pays_into_the_business_account():
    settings = InvoiceSettings.load()
    assert settings.bank_account_name == "Ethan Daniel Betts-Ingram"
    assert settings.bank_bsb == "067872"
    assert settings.bank_account_number == "74596050"
