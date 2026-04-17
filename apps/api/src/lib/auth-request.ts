import { NextRequest } from "next/server";
import { verifyUserJwt, type JwtPayload } from "./jwt";

export async function getBearerUser(req: NextRequest): Promise<JwtPayload | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    return await verifyUserJwt(token);
  } catch {
    return null;
  }
}

export async function requireUser(req: NextRequest): Promise<JwtPayload> {
  const user = await getBearerUser(req);
  if (!user) {
    const err = new Error("Unauthorized") as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return user;
}
