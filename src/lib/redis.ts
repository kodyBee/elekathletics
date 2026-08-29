import { Redis } from "@upstash/redis";

let client: Redis | null = null;

/**
 * Shared Upstash Redis client.
 *
 * Vercel's filesystem is read-only and ephemeral, so all persistent app data
 * (bookings, inquiries, coach auth) lives in Redis rather than on disk.
 *
 * Accepts either the Upstash-native env var names or the ones the Vercel
 * Marketplace integration injects (KV_REST_API_*).
 */
export function getRedis(): Redis {
  if (client) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis env vars. Set UPSTASH_REDIS_REST_URL and " +
        "UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL / KV_REST_API_TOKEN)."
    );
  }

  client = new Redis({ url, token });
  return client;
}

/**
 * Upstash auto-deserializes values that look like JSON, so a stored record can
 * come back as either a parsed object or a raw string depending on the client
 * version. Normalize both shapes.
 */
export function parseRecord<T>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as T;
  return null;
}
