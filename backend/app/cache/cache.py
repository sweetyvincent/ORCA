import time
import json
import sqlite3
import os
from typing import Optional, Any, Tuple
from pathlib import Path

class MarineDataCache:
    def __init__(self, db_path: str = "marine_cache.db", default_ttl: int = 3600):
        self.default_ttl = default_ttl
        self.memory_store: dict = {}
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS cache_entries (
                        cache_key TEXT PRIMARY KEY,
                        data_json TEXT NOT NULL,
                        created_at REAL NOT NULL,
                        expires_at REAL NOT NULL
                    )
                """)
                conn.commit()
        except Exception as e:
            print(f"[CACHE] Warning: SQLite init failed, using memory only: {e}")

    def make_key(self, provider: str, dataset: str, lat: float, lon: float, timeframe: str) -> str:
        # Quantize coords to 0.25 deg for spatial cache reuse
        q_lat = round(lat * 4) / 4
        q_lon = round(lon * 4) / 4
        return f"{provider}:{dataset}:{q_lat:.2f}:{q_lon:.2f}:{timeframe}"

    def get(self, key: str) -> Tuple[Optional[Any], bool]:
        """
        Returns (data, is_stale).
        If within TTL: returns (data, False)
        If expired but exists: returns (data, True) [for graceful degraded mode]
        If not found: returns (None, False)
        """
        now = time.time()
        
        # Check memory first
        if key in self.memory_store:
            entry = self.memory_store[key]
            if now < entry["expires_at"]:
                return entry["data"], False
            return entry["data"], True

        # Check SQLite
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT data_json, expires_at FROM cache_entries WHERE cache_key = ?", (key,))
                row = cursor.fetchone()
                if row:
                    data = json.loads(row[0])
                    expires_at = row[1]
                    is_stale = now >= expires_at
                    # populate memory
                    self.memory_store[key] = {"data": data, "expires_at": expires_at}
                    return data, is_stale
        except Exception as e:
            print(f"[CACHE] DB read error: {e}")

        return None, False

    def set(self, key: str, data: Any, ttl: Optional[int] = None):
        ttl = ttl or self.default_ttl
        now = time.time()
        expires_at = now + ttl
        
        self.memory_store[key] = {"data": data, "expires_at": expires_at}
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    "INSERT OR REPLACE INTO cache_entries (cache_key, data_json, created_at, expires_at) VALUES (?, ?, ?, ?)",
                    (key, json.dumps(data), now, expires_at)
                )
                conn.commit()
        except Exception as e:
            print(f"[CACHE] DB write error: {e}")

cache = MarineDataCache()
