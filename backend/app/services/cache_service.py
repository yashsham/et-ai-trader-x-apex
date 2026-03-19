"""
High-Performance Cache Service
- Primary: Redis (if configured)
- Fallback: In-Memory LRU + TTL Cache using OrderedDict (O(1) get/put/evict)

DSA: OrderedDict maintains insertion order → O(1) LRU eviction.
     Each entry stores (value, expiry_timestamp) for TTL-based invalidation.
"""
import json
import time
from collections import OrderedDict
from threading import RLock
from typing import Any, Optional
import redis
from app.core.config import settings


class LRUTTLCache:
    """
    Thread-safe in-memory LRU Cache with TTL eviction.
    - get: O(1) — move-to-end on hit
    - set: O(1) — append + evict oldest if over capacity
    - expired entries are lazily evicted on access
    """
    def __init__(self, max_size: int = 512):
        self._cache: OrderedDict[str, tuple] = OrderedDict()
        self._max_size = max_size
        self._lock = RLock()
        self._hits = 0
        self._misses = 0

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key not in self._cache:
                self._misses += 1
                return None
            value, expiry = self._cache[key]
            if time.monotonic() > expiry:
                # Lazy TTL eviction — O(1)
                del self._cache[key]
                self._misses += 1
                return None
            # LRU: move to most-recently-used end — O(1)
            self._cache.move_to_end(key)
            self._hits += 1
            return value

    def set(self, key: str, value: Any, expire_seconds: int = 3600):
        with self._lock:
            expiry = time.monotonic() + expire_seconds
            if key in self._cache:
                self._cache.move_to_end(key)
            self._cache[key] = (value, expiry)
            # Evict LRU entry if over capacity — O(1)
            if len(self._cache) > self._max_size:
                self._cache.popitem(last=False)

    def delete(self, key: str):
        with self._lock:
            self._cache.pop(key, None)

    def stats(self) -> dict:
        total = self._hits + self._misses
        hit_rate = (self._hits / total * 100) if total > 0 else 0
        return {
            "size": len(self._cache),
            "max_size": self._max_size,
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate_pct": round(hit_rate, 1)
        }


class CacheService:
    def __init__(self):
        self.redis_client = None
        if settings.REDIS_URL:
            try:
                self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                self.redis_client.ping()
                print("[Cache] Redis connected and healthy.")
            except Exception as e:
                print(f"[Cache] Redis unavailable: {e}. Using LRU+TTL in-memory cache.")

        # LRU+TTL in-memory fallback (max 512 entries)
        self._lru = LRUTTLCache(max_size=512)

    def get(self, key: str) -> Optional[Any]:
        if self.redis_client:
            try:
                val = self.redis_client.get(key)
                return json.loads(val) if val else None
            except Exception:
                pass
        return self._lru.get(key)

    def set(self, key: str, value: Any, expire_seconds: int = 3600):
        if self.redis_client:
            try:
                self.redis_client.setex(key, expire_seconds, json.dumps(value, default=str))
                return
            except Exception:
                pass
        self._lru.set(key, value, expire_seconds)

    def delete(self, key: str):
        if self.redis_client:
            try:
                self.redis_client.delete(key)
                return
            except Exception:
                pass
        self._lru.delete(key)

    def cache_stats(self) -> dict:
        if self.redis_client:
            try:
                info = self.redis_client.info("stats")
                return {"backend": "redis", "hits": info.get("keyspace_hits"), "misses": info.get("keyspace_misses")}
            except Exception:
                pass
        return {"backend": "lru_in_memory", **self._lru.stats()}


cache_service = CacheService()
