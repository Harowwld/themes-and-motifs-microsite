import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import { get, set, del } from "idb-keyval";

/**
 * IDB Keyval persister for React Query
 *
 * This persists the React Query cache to IndexedDB, allowing
 * previously loaded data to survive page reloads and browser sessions.
 *
 * Max age: 24 hours - data older than this is considered stale
 */
const CACHE_KEY = "tanstack-query-cache";
const MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Deep sanitize data to remove Promises, functions, and non-serializable objects
 * This prevents DataCloneError when storing to IndexedDB
 */
function sanitizeForStorage<T>(value: T): T {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle Promises - replace with null
  if (value instanceof Promise) {
    return null as T;
  }

  // Handle dates - convert to ISO string
  if (value instanceof Date) {
    return value.toISOString() as unknown as T;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(sanitizeForStorage) as unknown as T;
  }

  // Handle objects (but not functions, Maps, Sets, etc.)
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      const val = (value as Record<string, unknown>)[key];
      // Skip functions, symbols, and other non-serializable types
      if (typeof val === "function" || typeof val === "symbol") {
        continue;
      }
      result[key] = sanitizeForStorage(val);
    }
    return result as T;
  }

  // Primitives are fine
  return value;
}

/**
 * Serialize the client data to ensure it's JSON-safe
 * This prevents DataCloneError from Promises or other non-clonable objects
 */
function serializeClient(client: PersistedClient): string {
  // Deep sanitize to remove any Promises or non-clonable objects
  // that might have leaked into the cache during fast scrolling
  const sanitized = sanitizeForStorage(client);
  return JSON.stringify(sanitized);
}

/**
 * Deserialize the client data from storage
 */
function deserializeClient(data: string): PersistedClient {
  return JSON.parse(data) as PersistedClient;
}

export const idbPersister: Persister = {
  async persistClient(client: PersistedClient): Promise<void> {
    // Serialize to JSON string to ensure no Promises or non-clonable objects
    const serialized = serializeClient(client);
    await set(CACHE_KEY, {
      buster: "v1", // Version for future migrations
      timestamp: Date.now(),
      value: serialized,
    });
  },

  async restoreClient(): Promise<PersistedClient | undefined> {
    const data = await get<{
      buster: string;
      timestamp: number;
      value: string;
    } | undefined>(CACHE_KEY);

    if (!data) return undefined;

    // Check if cache is too old
    if (Date.now() - data.timestamp > MAX_AGE) {
      await del(CACHE_KEY);
      return undefined;
    }

    // Check version compatibility
    if (data.buster !== "v1") {
      await del(CACHE_KEY);
      return undefined;
    }

    try {
      return deserializeClient(data.value);
    } catch {
      // If deserialization fails, clear the cache
      await del(CACHE_KEY);
      return undefined;
    }
  },

  async removeClient(): Promise<void> {
    await del(CACHE_KEY);
  },
};
