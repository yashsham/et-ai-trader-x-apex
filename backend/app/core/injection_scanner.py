"""
Prompt Injection Scanner — adapted from yash-genai-prod-os (RegexInjectionScanner pattern).
Scans incoming requests for common prompt injection attack patterns.
Added trading-specific abuse patterns.
"""
import re

class InjectionScanner:
    PATTERNS = [
        r"ignore previous instructions",
        r"system override",
        r"delete all",
        r"you are now dan",
        r"forget your instructions",
        r"disregard your guidelines",
        r"act as an unrestricted",
        r"bypass your rules",
    ]

    def scan(self, text: str) -> dict:
        for pattern in self.PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return {
                    "is_safe": False,
                    "reason": f"Matched injection pattern: '{pattern}'"
                }
        return {"is_safe": True, "reason": "Clean"}


injection_scanner = InjectionScanner()
