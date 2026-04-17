import { getPool } from "@/lib/db";
import { hashToken, randomToken } from "@/lib/crypto-token";
import { sendMagicLinkEmail } from "@/lib/email";
import { errorJson, json } from "@/lib/api-response";

const TOKEN_TTL_MS = 1000 * 60 * 30; // 30 min

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !email.includes("@")) {
      return errorJson(req, "Invalid email", 400);
    }

    const base = process.env.MAGIC_LINK_BASE_URL;
    if (!base) {
      return errorJson(req, "MAGIC_LINK_BASE_URL is not configured", 500);
    }

    const pool = getPool();
    const userRes = await pool.query<{ id: string }>(
      `INSERT INTO users (email) VALUES ($1)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [email]
    );
    const userId = userRes.rows[0].id;

    const plain = randomToken(24);
    const tokenHash = hashToken(plain);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await pool.query(
      `INSERT INTO magic_link_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    const link = `${base.replace(/\/$/, "")}/auth/callback?token=${encodeURIComponent(plain)}`;
    await sendMagicLinkEmail(email, link);

    return json(req, { ok: true });
  } catch (e) {
    console.error(e);
    return errorJson(req, "Server error", 500);
  }
}
