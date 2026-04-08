import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Admin configuration: stores hashed password and other settings.
 * Only one row expected (id=1).
 */
export const adminConfig = mysqlTable("admin_config", {
  id: int("id").autoincrement().primaryKey(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  adminUsername: varchar("adminUsername", { length: 64 }).notNull().default("admin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminConfig = typeof adminConfig.$inferSelect;

/**
 * XSS tokens: each token represents a unique receiving endpoint /x/{token}
 */
export const xssTokens = mysqlTable("xss_tokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type XssToken = typeof xssTokens.$inferSelect;
export type InsertXssToken = typeof xssTokens.$inferInsert;

/**
 * XSS hits: records each time a payload fires
 */
export const xssHits = mysqlTable("xss_hits", {
  id: int("id").autoincrement().primaryKey(),
  tokenId: int("tokenId").notNull(),
  token: varchar("token", { length: 64 }).notNull(),
  // Captured data
  pageUrl: text("pageUrl"),
  originUrl: text("originUrl"),
  referer: text("referer"),
  userAgent: text("userAgent"),
  ip: varchar("ip", { length: 64 }),
  cookies: text("cookies"),
  dom: text("dom"),
  localStorage: text("localStorage"),
  sessionStorage: text("sessionStorage"),
  browserTime: varchar("browserTime", { length: 64 }),
  inIframe: boolean("inIframe").default(false),
  // Meta
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type XssHit = typeof xssHits.$inferSelect;
export type InsertXssHit = typeof xssHits.$inferInsert;

/**
 * Login attempt tracking for brute-force protection
 */
export const loginAttempts = mysqlTable("login_attempts", {
  id: int("id").autoincrement().primaryKey(),
  ip: varchar("ip", { length: 64 }).notNull(),
  attemptCount: int("attemptCount").default(1).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  lastAttempt: timestamp("lastAttempt").defaultNow().notNull(),
});

export type LoginAttempt = typeof loginAttempts.$inferSelect;
