import { describe, expect, it, beforeAll, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB functions to avoid real DB calls in unit tests
vi.mock("./db", () => ({
  getAdminConfig: vi.fn().mockResolvedValue(null),
  setAdminPassword: vi.fn().mockResolvedValue(undefined),
  checkLoginAllowed: vi.fn().mockResolvedValue({ allowed: true }),
  recordLoginFailure: vi.fn().mockResolvedValue(undefined),
  resetLoginAttempts: vi.fn().mockResolvedValue(undefined),
  getAllXssTokens: vi.fn().mockResolvedValue([]),
  createXssToken: vi.fn().mockResolvedValue({ id: 1, token: "test123", label: "test", createdAt: new Date() }),
  deleteXssToken: vi.fn().mockResolvedValue(undefined),
  getAllXssHits: vi.fn().mockResolvedValue([]),
  getXssHitById: vi.fn().mockResolvedValue(null),
  markHitRead: vi.fn().mockResolvedValue(undefined),
  deleteXssHit: vi.fn().mockResolvedValue(undefined),
  getUnreadHitCount: vi.fn().mockResolvedValue(0),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
}));

// Mock JWT functions
vi.mock("./_core/jwt", () => ({
  signToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  verifyToken: vi.fn().mockResolvedValue({ role: "xss_admin", username: "admin" }),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
      socket: { remoteAddress: "127.0.0.1" },
    } as any,
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as any,
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: { xss_admin_session: "mock-jwt-token" },
      socket: { remoteAddress: "127.0.0.1" },
    } as any,
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as any,
  };
}

describe("admin.check", () => {
  it("returns isAdmin=true when valid admin cookie present", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.check();
    expect(result.isAdmin).toBe(true);
  });

  it("returns isAdmin=false when no cookie", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.check();
    expect(result.isAdmin).toBe(false);
  });
});

describe("admin.setup", () => {
  beforeAll(() => {
    process.env.ADMIN_SETUP_KEY = "expected-setup-key";
  });

  it("rejects wrong setup key", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.setup({ username: "admin", password: "password123", setupKey: "wrong-key" })
    ).rejects.toThrow("Setup key 错误");
  });
});

describe("admin.login", () => {
  it("rejects login when no admin config exists", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.login({ username: "admin", password: "password123" })
    ).rejects.toThrow("管理员账号未初始化");
  });
});

describe("tokens.list", () => {
  it("returns empty list for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tokens.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects unauthenticated access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tokens.list()).rejects.toThrow();
  });
});

describe("hits.unreadCount", () => {
  it("returns count=0 for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.hits.unreadCount();
    expect(result.count).toBe(0);
  });
});
