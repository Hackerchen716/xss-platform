import { and, desc, eq, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  AdminConfig,
  InsertUser,
  InsertXssHit,
  InsertXssToken,
  adminConfig,
  loginAttempts,
  users,
  xssHits,
  xssTokens,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Admin Config ─────────────────────────────────────────────────────────────

export async function getAdminConfig(): Promise<AdminConfig | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adminConfig).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setAdminPassword(username: string, passwordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await getAdminConfig();
  if (existing) {
    await db
      .update(adminConfig)
      .set({ passwordHash, adminUsername: username })
      .where(eq(adminConfig.id, existing.id));
  } else {
    await db.insert(adminConfig).values({ passwordHash, adminUsername: username });
  }
}

// ─── Login Attempts (Brute-force protection) ──────────────────────────────────

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function checkLoginAllowed(ip: string): Promise<{ allowed: boolean; lockedUntil?: Date }> {
  const db = await getDb();
  if (!db) return { allowed: true };

  const result = await db.select().from(loginAttempts).where(eq(loginAttempts.ip, ip)).limit(1);
  if (result.length === 0) return { allowed: true };

  const record = result[0];
  if (record.lockedUntil && record.lockedUntil > new Date()) {
    return { allowed: false, lockedUntil: record.lockedUntil };
  }
  return { allowed: true };
}

export async function recordLoginFailure(ip: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const result = await db.select().from(loginAttempts).where(eq(loginAttempts.ip, ip)).limit(1);
  if (result.length === 0) {
    await db.insert(loginAttempts).values({ ip, attemptCount: 1, lastAttempt: new Date() });
  } else {
    const record = result[0];
    const newCount = (record.attemptCount || 0) + 1;
    const lockedUntil = newCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS) : null;
    await db
      .update(loginAttempts)
      .set({ attemptCount: newCount, lastAttempt: new Date(), lockedUntil })
      .where(eq(loginAttempts.ip, ip));
  }
}

export async function resetLoginAttempts(ip: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(loginAttempts).where(eq(loginAttempts.ip, ip));
}

// ─── XSS Tokens ───────────────────────────────────────────────────────────────

export async function createXssToken(data: InsertXssToken) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(xssTokens).values(data);
  const result = await db.select().from(xssTokens).where(eq(xssTokens.token, data.token)).limit(1);
  return result[0];
}

export async function getAllXssTokens() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(xssTokens).orderBy(desc(xssTokens.createdAt));
}

export async function getXssTokenByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(xssTokens).where(eq(xssTokens.token, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteXssToken(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(xssHits).where(eq(xssHits.tokenId, id));
  await db.delete(xssTokens).where(eq(xssTokens.id, id));
}

// ─── XSS Hits ─────────────────────────────────────────────────────────────────

export async function createXssHit(data: InsertXssHit) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(xssHits).values(data);
}

export async function getAllXssHits() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(xssHits).orderBy(desc(xssHits.createdAt));
}

export async function getXssHitsByToken(token: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(xssHits).where(eq(xssHits.token, token)).orderBy(desc(xssHits.createdAt));
}

export async function getXssHitById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(xssHits).where(eq(xssHits.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function markHitRead(id: number, isRead: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(xssHits).set({ isRead }).where(eq(xssHits.id, id));
}

export async function deleteXssHit(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(xssHits).where(eq(xssHits.id, id));
}

export async function markAllHitsRead() {
  const db = await getDb();
  if (!db) return;
  await db.update(xssHits).set({ isRead: true }).where(eq(xssHits.isRead, false));
}

export async function getUnreadHitCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(xssHits).where(eq(xssHits.isRead, false));
  return result.length;
}
