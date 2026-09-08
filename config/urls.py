from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    path("api/", include("dealers.urls")),
    path("api/", include("seo.urls")),
    path("api/payments/", include("payments.urls")),
]

