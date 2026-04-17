import { getPool } from "@/lib/db";
import { hashToken } from "@/lib/crypto-token";
import { signUserJwt } from "@/lib/jwt";
import { errorJson, json } from "@/lib/api-response";

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { token?: string };
    const plain = typeof body.token === "string" ? body.token : "";
    if (!plain) {
      return errorJson(req, "Missing token", 400);
    }

    const tokenHash = hashToken(plain);
    const pool = getPool();

    const res = await pool.query<{ user_id: string; id: string; email: string }>(
      `SELECT m.id, m.user_id, u.email
       FROM magic_link_tokens m
       JOIN users u ON u.id = m.user_id
       WHERE m.token_hash = $1 AND m.used_at IS NULL AND m.expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    if (res.rows.length === 0) {
      return errorJson(req, "Invalid or expired token", 400);
    }

    const row = res.rows[0];
    await pool.query(`UPDATE magic_link_tokens SET used_at = NOW() WHERE id = $1`, [row.id]);

    const token = await signUserJwt({ userId: row.user_id, email: row.email });
    return json(req, { token });
  } catch (e) {
    console.error(e);
    return errorJson(req, "Server error", 500);
  }
}
