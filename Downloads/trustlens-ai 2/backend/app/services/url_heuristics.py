"""
Deterministic, non-AI URL heuristics. These are cheap, explainable signals
computed BEFORE calling Gemini, then passed to Gemini as extra context so
the AI's judgment is grounded in concrete facts rather than guessing.
"""
import re
import tldextract

KNOWN_BRANDS = [
    "google", "facebook", "instagram", "whatsapp", "paypal", "amazon",
    "flipkart", "sbi", "hdfc", "icici", "axisbank", "paytm", "phonepe",
    "gpay", "irctc", "uidai", "incometax", "rbi", "npci",
]


def _levenshtein(a: str, b: str) -> int:
    if len(a) < len(b):
        return _levenshtein(b, a)
    if len(b) == 0:
        return len(a)
    previous_row = range(len(b) + 1)
    for i, ca in enumerate(a):
        current_row = [i + 1]
        for j, cb in enumerate(b):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (ca != cb)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def analyze_url(url: str) -> dict:
    """Returns a dict of deterministic signals used as Gemini context."""
    url = url.strip()
    https_present = url.lower().startswith("https://")

    extracted = tldextract.extract(url)
    domain = extracted.domain.lower()
    full_domain = f"{extracted.domain}.{extracted.suffix}".lower()

    # Typosquatting check: is this domain suspiciously close to a known brand
    # without being an exact match?
    typosquat_candidate = None
    min_distance = None
    for brand in KNOWN_BRANDS:
        if domain == brand:
            continue
        dist = _levenshtein(domain, brand)
        if dist <= 2 and (min_distance is None or dist < min_distance):
            typosquat_candidate = brand
            min_distance = dist

    suspicious_chars = bool(re.search(r"[0-9]{3,}|-{2,}", domain))
    excessive_subdomains = extracted.subdomain.count(".") >= 2 if extracted.subdomain else False

    return {
        "https_present": https_present,
        "domain": full_domain,
        "typosquat_suspected_brand": typosquat_candidate,
        "typosquat_edit_distance": min_distance,
        "suspicious_characters_in_domain": suspicious_chars,
        "excessive_subdomains": excessive_subdomains,
    }
