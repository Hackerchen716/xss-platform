import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, router } from "./_core/trpc";
import {
  checkLoginAllowed,
  createXssHit,
  createXssToken,
  deleteXssHit,
  deleteXssToken,
  getAdminConfig,
  getAllXssHits,
  getAllXssTokens,
  getUnreadHitCount,
  markAllHitsRead,
  getXssHitById,
  getXssTokenByToken,
  markHitRead,
  recordLoginFailure,
  resetLoginAttempts,
  setAdminPassword,
} from "./db";
import { ENV } from "./_core/env";
import { signToken, verifyToken } from "./_core/jwt";

// Custom session cookie name for admin auth
const ADMIN_COOKIE = "xss_admin_session";

// Helper to get admin from request context
async function getAdminFromCookie(req: any): Promise<boolean> {
  const cookie = req.cookies?.[ADMIN_COOKIE];
  if (!cookie) return false;
  try {
    const payload = await verifyToken(cookie);
    return payload?.role === "xss_admin";
  } catch {
    return false;
  }
}

// Admin-only procedure
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const isAdmin = await getAdminFromCookie(ctx.req);
  if (!isAdmin) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "需要管理员权限" });
  }
  return next({ ctx: { ...ctx, isAdmin: true } });
});

export const appRouter = router({
  // ─── Admin Auth ──────────────────────────────────────────────────────────────
  admin: router({
    // Check if admin is logged in
    check: publicProcedure.query(async ({ ctx }) => {
      const isAdmin = await getAdminFromCookie(ctx.req);
      return { isAdmin };
    }),

    // Login with username + password
    login: publicProcedure
      .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const ip = (ctx.req.headers["x-forwarded-for"] as string) || ctx.req.socket?.remoteAddress || "unknown";

        // Check brute-force lock
        const lockCheck = await checkLoginAllowed(ip);
        if (!lockCheck.allowed) {
          const minutes = lockCheck.lockedUntil
            ? Math.ceil((lockCheck.lockedUntil.getTime() - Date.now()) / 60000)
            : 15;
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `登录尝试过多，请 ${minutes} 分钟后再试`,
          });
        }

        const config = await getAdminConfig();
        if (!config) {
          throw new TRPCError({ code: "NOT_FOUND", message: "管理员账号未初始化，请先设置密码" });
        }

        const usernameMatch = input.username === config.adminUsername;
        const passwordMatch = await bcrypt.compare(input.password, config.passwordHash);

        if (!usernameMatch || !passwordMatch) {
          await recordLoginFailure(ip);
          throw new TRPCError({ code: "UNAUTHORIZED", message: "用户名或密码错误" });
        }

        await resetLoginAttempts(ip);

        // Issue JWT session
        const token = await signToken({ role: "xss_admin", username: input.username });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(ADMIN_COOKIE, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return { success: true };
      }),

    // Logout
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(ADMIN_COOKIE, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),

    // Change password (requires current admin session)
    changePassword: adminProcedure
      .input(
        z.object({
          oldPassword: z.string().min(1),
          newPassword: z.string().min(8).max(128),
        })
      )
      .mutation(async ({ input }) => {
        // Verify old password against stored hash
        const admin = await getAdminConfig();
        if (!admin) throw new TRPCError({ code: "NOT_FOUND", message: "管理员账号不存在" });
        const valid = await bcrypt.compare(input.oldPassword, admin.passwordHash);
        if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "当前密码错误" });
        const hash = await bcrypt.hash(input.newPassword, 12);
        await setAdminPassword(admin.adminUsername, hash);
        return { success: true };
      }),

    // Setup initial password (only if no admin exists)
    setup: publicProcedure
      .input(
        z.object({
          username: z.string().min(1).max(64),
          password: z.string().min(8).max(128),
          setupKey: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Require an explicitly configured setup key in production.
        const expectedKey = process.env.ADMIN_SETUP_KEY;
        if (!expectedKey) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Setup key 未配置" });
        }
        if (input.setupKey !== expectedKey) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Setup key 错误" });
        }
        const existing = await getAdminConfig();
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "管理员账号已存在" });
        }
        const hash = await bcrypt.hash(input.password, 12);
        await setAdminPassword(input.username, hash);
        return { success: true };
      }),
  }),

  // ─── XSS Tokens ──────────────────────────────────────────────────────────────
  tokens: router({
    list: adminProcedure.query(async () => {
      return getAllXssTokens();
    }),

    create: adminProcedure
      .input(z.object({ label: z.string().max(128).optional() }))
      .mutation(async ({ input }) => {
        const token = nanoid(16);
        return createXssToken({ token, label: input.label });
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteXssToken(input.id);
        return { success: true };
      }),
  }),

  // ─── XSS Hits ─────────────────────────────────────────────────────────────────
  hits: router({
    list: adminProcedure.query(async () => {
      return getAllXssHits();
    }),

    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const hit = await getXssHitById(input.id);
        if (!hit) throw new TRPCError({ code: "NOT_FOUND" });
        return hit;
      }),

    markRead: adminProcedure
      .input(z.object({ id: z.number(), isRead: z.boolean() }))
      .mutation(async ({ input }) => {
        await markHitRead(input.id, input.isRead);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteXssHit(input.id);
        return { success: true };
      }),

    markAllRead: adminProcedure.mutation(async () => {
      await markAllHitsRead();
      return { success: true };
    }),

    unreadCount: adminProcedure.query(async () => {
      return { count: await getUnreadHitCount() };
    }),
  }),
});

export type AppRouter = typeof appRouter;
