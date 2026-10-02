from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import SeoSetupStep, SeoSubscriber
from ..serializers import SeoSetupStepSerializer
from ..utils import setup
from ..utils.google_access import AccessCheckUnavailable
from ..utils.permissions import IsSeoSubscriber


def _setup_payload(subscriber):
    return {
        "steps": SeoSetupStepSerializer(setup.setup_steps(subscriber), many=True).data,
        "complete": setup.is_setup_complete(subscriber),
    }


def _paid_subscriber(request):
    subscriber = request.user.seo_subscriber
    if not subscriber.has_paid:
        raise PermissionDenied("Complete payment before setting up your access.")
    return subscriber


def _step(subscriber, key, *, lock=False):
    if key not in SeoSetupStep.Key.values:
        raise NotFound("No such setup step.")
    setup.setup_steps(subscriber)
    queryset = SeoSetupStep.objects.select_related("subscriber")
    if lock:
        queryset = queryset.select_for_update()
    return queryset.get(subscriber=subscriber, key=key)


class SeoSetupView(APIView):
    """The signed-in subscriber's setup checklist."""

    throttle_scope = "portal"
    permission_classes = [IsSeoSubscriber]

    def get(self, request):
        return Response(_setup_payload(_paid_subscriber(request)))


class SeoSetupMarkView(APIView):
    """The customer marking a step done, or taking that back."""

    throttle_scope = "portal"
    permission_classes = [IsSeoSubscriber]

    def post(self, request, key):
        subscriber = _paid_subscriber(request)
        done = request.data.get("done")
        if not isinstance(done, bool):
            raise ValidationError({"done": "Send true or false."})
        with transaction.atomic():
            setup.mark_step(_step(subscriber, key, lock=True), done=done)
        return Response(_setup_payload(subscriber))


class SeoSetupCheckView(APIView):
    """Ask Google whether a step's access works, confirming it if it does.

    ``result`` is ``confirmed``, ``not_found`` (we looked, it isn't there yet) or
    ``unavailable`` (the check couldn't run; nothing was learned about the
    customer's setup and the step is left for staff).
    """

    throttle_scope = "seo-access-check"
    permission_classes = [IsSeoSubscriber]

    def post(self, request, key):
        subscriber = _paid_subscriber(request)
        if key not in setup.CHECKS:
            raise NotFound("This step has no automatic check.")
        try:
            # Outside the transaction: a row lock held across Google's API
            # would turn their slow day into ours.
            found = setup.look_up_access(subscriber, key)
        except AccessCheckUnavailable:
            return Response({"result": "unavailable", **_setup_payload(subscriber)})
        if found:
            with transaction.atomic():
                setup.confirm_step(_step(subscriber, key, lock=True), detail=found)
        return Response({"result": "confirmed" if found else "not_found", **_setup_payload(subscriber)})


class AdminSeoSetupStepView(APIView):
    """Staff confirming a step by hand, or resetting it."""

    throttle_scope = "staff"
    permission_classes = [IsAdminUser]

    def post(self, request, pk, key):
        subscriber = get_object_or_404(SeoSubscriber, pk=pk)
        action = request.data.get("action")
        if action not in {"confirm", "reset"}:
            raise ValidationError({"action": "Send confirm or reset."})
        with transaction.atomic():
            step = _step(subscriber, key, lock=True)
            if action == "confirm":
                setup.confirm_step(step)
            else:
                setup.reset_step(step)
        return Response(_setup_payload(subscriber))
