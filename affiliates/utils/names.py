"""A first name from an RSS owner name, when it is a person's."""

import re

# Owner names that are a show, a company or a team, not a person.
NOT_A_PERSON = {
    "podcast", "podcasts", "media", "network", "networks", "studio", "studios", "team",
    "productions", "production", "show", "radio", "the", "and", "&", "inc", "llc", "pty",
    "ltd", "group", "co", "company", "fm", "news", "official", "crew", "collective", "hq",
    "australia", "abc", "sbs", "magazine", "church", "ministries", "university", "club",
}

WORD = re.compile(r"[A-Za-z][A-Za-z'\-]*")


def first_name(host_name: str) -> str:
    """``Sam`` from ``Sam Lee``; empty for ``The Tradie Show Team`` or ``sam@...``."""
    words = host_name.strip().split()
    if not 1 <= len(words) <= 3:
        return ""
    if any(word.lower().strip(".,") in NOT_A_PERSON for word in words):
        return ""
    first = words[0].strip(".,")
    if not WORD.fullmatch(first) or len(first) < 2:
        return ""
    return first[0].upper() + first[1:]
