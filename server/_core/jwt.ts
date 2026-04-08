import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

const DEV_SECRET = "xss-platform-dev-secret-change-me";

function getSecret() {
  if (!ENV.cookieSecret && ENV.isProduction) {
    throw new Error("JWT_SECRET must be set in production");
  }

  return new TextEncoder().encode(ENV.cookieSecret || DEV_SECRET);
}

export async function signToken(payload: Record<string, unknown>, expiresIn = "7d"): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}
