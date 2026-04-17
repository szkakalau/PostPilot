import { getPool } from "@/lib/db";
import { errorJson, json } from "@/lib/api-response";

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

    const pool = getPool();
    await pool.query(
      `INSERT INTO waitlist_emails (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      [email]
    );
    return json(req, { ok: true });
  } catch (e) {
    console.error(e);
    return errorJson(req, "Server error", 500);
  }
}
