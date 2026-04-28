// Client-side cache utilities for auth and data caching

const AUTH_CACHE_KEY = "tm_auth_cache";
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

type AuthCacheData = {
  signedIn: boolean;
  isVendor: boolean;
  isSoonToWed: boolean;
  timestamp: number;
};

export const authCache = {
  get(): AuthCacheData | null {
    if (typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (!cached) return null;
      const data = JSON.parse(cached) as AuthCacheData;
      // Check if cache is still valid
      if (Date.now() - data.timestamp > AUTH_CACHE_TTL) {
        localStorage.removeItem(AUTH_CACHE_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  set(signedIn: boolean, isVendor: boolean, isSoonToWed: boolean) {
    if (typeof window === "undefined") return;
    try {
      const data: AuthCacheData = {
        signedIn,
        isVendor,
        isSoonToWed,
        timestamp: Date.now(),
      };
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(data));
    } catch {
      // Ignore localStorage errors
    }
  },

  clear() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(AUTH_CACHE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  },
};

// Generic data cache utility
const DATA_CACHE_PREFIX = "tm_data_";
const DEFAULT_DATA_TTL = 60 * 1000; // 1 minute default

type DataCacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

export function createDataCache<T>(key: string, ttl: number = DEFAULT_DATA_TTL) {
  const cacheKey = `${DATA_CACHE_PREFIX}${key}`;

  return {
    get(): T | null {
      if (typeof window === "undefined") return null;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;
        const entry = JSON.parse(cached) as DataCacheEntry<T>;
        if (Date.now() - entry.timestamp > entry.ttl) {
          localStorage.removeItem(cacheKey);
          return null;
        }
        return entry.data;
      } catch {
        return null;
      }
    },

    set(data: T) {
      if (typeof window === "undefined") return;
      try {
        const entry: DataCacheEntry<T> = {
          data,
          timestamp: Date.now(),
          ttl,
        };
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch {
        // Ignore localStorage errors (e.g., quota exceeded)
      }
    },

    clear() {
      if (typeof window === "undefined") return;
      try {
        localStorage.removeItem(cacheKey);
      } catch {
        // Ignore
      }
    },
  };
}

// Pre-defined caches for common data
export const categoriesCache = createDataCache<any[]>("categories", 60 * 60 * 1000); // 1 hour
export const vendorLocationsCache = createDataCache<any[]>("vendor_locations", 30 * 60 * 1000); // 30 min
export const featuredVendorsCache = createDataCache<any[]>("featured_vendors", 5 * 60 * 1000); // 5 min
export const featuredPromosCache = createDataCache<any[]>("featured_promos", 5 * 60 * 1000); // 5 min
