import time
import logging
from typing import Any, Optional, Dict

logger = logging.getLogger(__name__)

class CacheService:
    """
    A production-grade in-memory cache with TTL (Time To Live).
    Designed to be easily swapped with Redis for horizontal scaling.
    """
    def __init__(self, default_ttl: int = 3600):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[Any]:
        """Retrieve a value if it exists and hasn't expired."""
        if key not in self._cache:
            self.misses += 1
            return None
        
        item = self._cache[key]
        if time.time() > item["expiry"]:
            logger.info(f"[Cache] Key expired: {key}")
            del self._cache[key]
            self.misses += 1
            return None
        
        logger.info(f"[Cache] Hit: {key}")
        self.hits += 1
        return item["value"]

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Store a value with a specific or default TTL."""
        expiry = time.time() + (ttl or self.default_ttl)
        self._cache[key] = {
            "value": value,
            "expiry": expiry
        }
        logger.info(f"[Cache] Set: {key} (Exp: {expiry})")

    def cache_stats(self) -> Dict[str, Any]:
        """Production observability snapshot."""
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": f"{hit_rate:.2f}%",
            "size": len(self._cache),
            "keys": list(self._cache.keys())
        }

    def delete(self, key: str):
        """Remove a key manually."""
        if key in self._cache:
            del self._cache[key]

    def clear(self):
        """Flush the entire cache."""
        self._cache.clear()
        self.hits = 0
        self.misses = 0

# Global singleton
cache_service = CacheService()
