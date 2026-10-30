import factory
from django.core.files.base import ContentFile

from seo.models import SeoProspect

PDF = b"%PDF-1.7\n% a prospect report\n"


def upload_fields(**overrides) -> dict:
    """One published report, as the pipeline's send.py posts it (the PDF apart)."""
    return {
        "domain": "perthpatiomagic.com.au",
        "business": "Perth Patio Magic",
        "slug": "perthpatiomagic",
        "report_version": "r1",
        "report_path": "C:/Users/ethan/coding/ftp_search/_search/projects/perthpatiomagic/reports/r1/perthpatiomagic_seo_report_r1.pdf",
        "contact_name": "Reece Cunningham",
        "email": "sales@perthpatiomagic.com.au",
        "email_source": "https://perthpatiomagic.com.au/about-us/",
        "phone": "0497 279 112",
        "overview": "Perth Patio Magic, patio builder in Ascot",
        "issues": ["No pergola page", "The home page has no heading"],
        "paid_searches": ["pergolas perth"],
        "recommendation_count": 10,
        "body": "Hi Reece,\n\nI picked Perth Patio Magic because...\n\nEthan Betts",
        **overrides,
    }


class SeoProspectFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SeoProspect

    domain = factory.Sequence(lambda n: f"business{n}.com.au")
    business = factory.Sequence(lambda n: f"Business {n}")
    slug = factory.Sequence(lambda n: f"business{n}")
    report_version = "r1"
    report_path = factory.LazyAttribute(lambda o: f"C:/reports/{o.slug}/r1/{o.slug}_seo_report_r1.pdf")
    report_pdf = factory.LazyAttribute(lambda o: ContentFile(PDF, name=f"{o.slug}_r1.pdf"))
    email = factory.Sequence(lambda n: f"owner{n}@business{n}.com.au")
    overview = "A Perth business"
    issues = factory.LazyFunction(lambda: ["No page for the search"])
    paid_searches = factory.LazyFunction(lambda: ["plumber perth"])
    recommendation_count = 10
    subject_version = 1
    body = "Hi there,\n\nThe report is attached.\n\nEthan Betts"
