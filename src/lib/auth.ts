import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { getRedis } from "@/lib/redis";

export interface AuthData {
  passwordHash: string;
  salt: string;
  mustChangePassword: boolean;
  updatedAt: string;
}

export interface SessionData {
  createdAt: string;
  mustChangePassword: boolean;
}

const AUTH_KEY = "coach:auth";
const SESSION_PREFIX = "coach:session:";
const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

export const SESSION_COOKIE = "coach_session";

const DEFAULT_PASSWORD = "changeme123";

/** 32 random bytes, hex-encoded. */
const SESSION_ID_SHAPE = /^[a-f0-9]{64}$/;

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

/** Length-guarded so `timingSafeEqual` cannot throw on a mismatch. */
function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * A second password that only works outside production.
 *
 * Lets a developer stay logged in after Elek sets his own password, without
 * a second account or resetting his. The `NODE_ENV` check is evaluated at
 * runtime on every call, and Vercel always builds with NODE_ENV=production,
 * so this cannot open a door on the deployed site even if the variable is
 * set there by accident.
 */
function devPassword(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  return process.env.DEV_COACH_PASSWORD || null;
}

/** Checks a password against the stored hash. No dev bypass — see `verifyLogin`. */
export async function verifyPassword(password: string): Promise<boolean> {
  if (typeof password !== "string" || password.length === 0) return false;
  const data = await getAuthData();
  const candidate = Buffer.from(hashPassword(password, data.salt), "hex");
  const stored = Buffer.from(data.passwordHash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

/**
 * Login check. Accepts the dev password when one is configured and we are not
 * in production; kept separate from `verifyPassword` so the dev credential can
 * never satisfy the "current password" or "must be different" checks when
 * changing the real one.
 */
export async function verifyLogin(password: string): Promise<boolean> {
  if (typeof password !== "string" || password.length === 0) return false;
  const dev = devPassword();
  if (dev && constantTimeEquals(password, dev)) return true;
  return verifyPassword(password);
}

export async function mustChangePassword(): Promise<boolean> {
  const data = await getAuthData();
  return data.mustChangePassword;
}

export async function changePassword(newPassword: string): Promise<void> {
  const redis = getRedis();
  await redis.set(AUTH_KEY, buildAuthData(newPassword, false));
}

// ─── Sessions ───────────────────────────────────────────────────────────────
//
// The cookie carries an unguessable id; the truth lives in Redis. The previous
// scheme stored the literal string "true", which anyone could set by hand to
// reach the dashboard and every customer inquiry.

export async function createSession(
  mustChange: boolean
): Promise<string> {
  const id = randomBytes(32).toString("hex");
  const session: SessionData = {
    createdAt: new Date().toISOString(),
    mustChangePassword: mustChange,
  };
  await getRedis().set(`${SESSION_PREFIX}${id}`, session, {
    ex: SESSION_TTL_SEC,
  });
  return id;
}

/**
 * Resolves a session id to its record, or null.
 *
 * The shape check runs first: the id is interpolated into a Redis key, and it
 * also means a junk cookie costs no round trip.
 */
export async function getSession(
  id: string | undefined | null
): Promise<SessionData | null> {
  if (!id || !SESSION_ID_SHAPE.test(id)) return null;
  return (await getRedis().get<SessionData>(`${SESSION_PREFIX}${id}`)) ?? null;
}

export async function destroySession(
  id: string | undefined | null
): Promise<void> {
  if (!id || !SESSION_ID_SHAPE.test(id)) return;
  await getRedis().del(`${SESSION_PREFIX}${id}`);
}

/** Invalidates every session. Called when the password changes. */
export async function destroyAllSessions(): Promise<void> {
  const redis = getRedis();
  let cursor = "0";
  do {
    const [next, keys]: [string, string[]] = await redis.scan(cursor, {
      match: `${SESSION_PREFIX}*`,
      count: 100,
    });
    if (keys.length > 0) await redis.del(...keys);
    cursor = next;
  } while (cursor !== "0");
}
