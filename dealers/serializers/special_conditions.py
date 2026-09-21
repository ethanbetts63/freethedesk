"""Reading and writing a dealer's Special Conditions.

Three rules the interface has to carry are enforced here rather than there,
because an interface rule is one an API call walks straight past:

1. **SC2 and SC6 cannot be removed.** A request that switches one off is
   refused, not silently corrected — a dealer who believes they have removed the
   authority to lodge and finds it on their contracts has been misled.
2. **Their own additions are never reviewed, validated or commented on.** The
   only checks below are length and shape. Nothing here has an opinion about
   whether a clause is a good idea, because the moment it does it has crossed
   into advising them about their business.
3. **No clause library.** There is nothing to choose from beyond the defaults
   and what they write themselves.
"""

from freetheplatform.security import bounds
from rest_framework import serializers

from ..utils import special_conditions

#: A clause a dealer writes is a heading and some paragraphs, and both are
#: bounded. `long_text` rather than `note` because this is a contract term
#: somebody may genuinely write at length, and `html` would be an invitation.
MAX_ADDITIONS = 20
MAX_PARAGRAPHS = 20


class SpecialConditionAdditionSerializer(serializers.Serializer):
    heading = serializers.CharField(max_length=bounds.FIELD_MAX["line"])
    paragraphs = serializers.ListField(
        child=serializers.CharField(max_length=bounds.FIELD_MAX["long_text"]),
        allow_empty=False,
        max_length=MAX_PARAGRAPHS,
    )


class SpecialConditionChoicesSerializer(serializers.Serializer):
    """What the dealer is submitting: which defaults to keep, and their own."""

    defaults = serializers.DictField(child=serializers.BooleanField())
    additions = SpecialConditionAdditionSerializer(
        many=True, required=False, max_length=MAX_ADDITIONS
    )

    def validate_defaults(self, value):
        unknown = sorted(set(value) - set(special_conditions.BY_NUMBER))
        if unknown:
            raise serializers.ValidationError(
                f"Not conditions in this contract: {', '.join(unknown)}."
            )
        refused = sorted(
            number
            for number in special_conditions.REQUIRED_NUMBERS
            if value.get(number) is False
        )
        if refused:
            names = ", ".join(
                f"{number} ({special_conditions.BY_NUMBER[number].heading})"
                for number in refused
            )
            raise serializers.ValidationError(
                f"{names} cannot be removed. Without them this product cannot lodge "
                "your customer's application or take their signature electronically."
            )
        return value

    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        return {
            "defaults": value["defaults"],
            "additions": [
                {"heading": entry["heading"], "paragraphs": entry["paragraphs"]}
                for entry in value.get("additions", [])
            ],
        }


def conditions_payload(profile):
    """The whole screen: every default clause in full, with its current answer.

    The clause text is sent rather than summarised because the dealer is being
    asked to decide whether to keep it, and a decision made against a one-line
    description is not the approval this records.
    """
    choices = special_conditions.normalise_choices(profile.condition_choices)
    return {
        "version": special_conditions.VERSION,
        "statement": special_conditions.ACCEPTANCE_STATEMENT,
        "conditions": [
            {
                "number": condition.number,
                "heading": condition.heading,
                "applies": condition.applies,
                "removable": condition.removable,
                "kept": choices["defaults"][condition.number],
                "paragraphs": special_conditions.render(
                    condition, special_conditions.SAMPLE_CONTEXT
                ),
                "alternative_heading": condition.alternative_heading,
                "alternative_paragraphs": special_conditions.render(
                    condition, special_conditions.SAMPLE_CONTEXT, alternative=True
                ),
            }
            for condition in special_conditions.DEFAULT_CONDITIONS
        ],
        "additions": choices["additions"],
    }
