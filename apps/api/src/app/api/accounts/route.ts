import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth-request";
import { getPool } from "@/lib/db";
import { errorJson, json } from "@/lib/api-response";

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const pool = getPool();
    const res = await pool.query(
      `SELECT id, platform, account_name, account_id, avatar_url, created_at
       FROM social_accounts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.userId]
    );
    return json(req, res.rows);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 401) return errorJson(req, "Unauthorized", 401);
    console.error(e);
    return errorJson(req, "Server error", 500);
  }
}
