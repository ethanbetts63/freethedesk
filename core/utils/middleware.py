class NoCacheApiMiddleware:
    """Prevent authenticated and personally identifying API data being cached.

    A view serving a file meant for anyone to fetch and keep (a report link's preview picture, which chat and
    text apps fetch apart from the page) says so itself with a ``public`` Cache-Control, and is left alone.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith("/api/") and "public" not in response.get("Cache-Control", "").split(", "):
            response["Cache-Control"] = "no-store, private"
        return response
