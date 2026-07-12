import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export interface AuthData {
  passwordHash: string;
  salt: string;
  mustChangePassword: boolean;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "auth.json");
const DEFAULT_PASSWORD = "changeme123";

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

async function ensureAuthFile(): Promise<AuthData> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    const data = buildAuthData(DEFAULT_PASSWORD, true);
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return data;
  }
  const raw = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as AuthData;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const data = await ensureAuthFile();
  const candidate = Buffer.from(hashPassword(password, data.salt), "hex");
  const stored = Buffer.from(data.passwordHash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

export async function mustChangePassword(): Promise<boolean> {
  const data = await ensureAuthFile();
  return data.mustChangePassword;
}

export async function changePassword(newPassword: string): Promise<void> {
  await ensureAuthFile();
  const data = buildAuthData(newPassword, false);
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}
