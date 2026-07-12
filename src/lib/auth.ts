import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";

export interface AuthData {
  passwordHash: string;
  salt: string;
  mustChangePassword: boolean;
  updatedAt: string;
}

const AUTH_KEY = "coach:auth";
const DEFAULT_PASSWORD = "changeme123";

let client: Redis | null = null;

function getRedis(): Redis {
  if (client) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis env vars (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)."
    );
  }
  client = new Redis({ url, token });
  return client;
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function buildAuthData(password: string, mustChangePassword: boolean): AuthData {
  const salt = randomBytes(16).toString("hex");
  return {
    salt,
    passwordHash: hashPassword(password, salt),
    mustChangePassword,
    updatedAt: new Date().toISOString(),
  };
}

async function getAuthData(): Promise<AuthData> {
  const redis = getRedis();
  const existing = await redis.get<AuthData>(AUTH_KEY);
  if (existing) return existing;
  const seeded = buildAuthData(DEFAULT_PASSWORD, true);
  await redis.set(AUTH_KEY, seeded);
  return seeded;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const data = await getAuthData();
  const candidate = Buffer.from(hashPassword(password, data.salt), "hex");
  const stored = Buffer.from(data.passwordHash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

export async function mustChangePassword(): Promise<boolean> {
  const data = await getAuthData();
  return data.mustChangePassword;
}

export async function changePassword(newPassword: string): Promise<void> {
  const redis = getRedis();
  const data = buildAuthData(newPassword, false);
  await redis.set(AUTH_KEY, data);
}
