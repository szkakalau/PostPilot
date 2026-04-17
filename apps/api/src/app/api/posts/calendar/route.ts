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
    const month = req.nextUrl.searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return errorJson(req, "month query required (YYYY-MM)", 400);
    }

    const [y, m] = month.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));

    const pool = getPool();
    const res = await pool.query<{
      id: string;
      content: string;
      scheduled_at: Date | null;
      status: string;
      platforms: string[] | null;
    }>(
      `SELECT p.id, p.content, p.scheduled_at, p.status,
              COALESCE(array_agg(DISTINCT pp.platform) FILTER (WHERE pp.platform IS NOT NULL), '{}') AS platforms
       FROM posts p
       LEFT JOIN post_platforms pp ON pp.post_id = p.id
       WHERE p.user_id = $1
         AND p.scheduled_at IS NOT NULL
         AND p.scheduled_at >= $2
         AND p.scheduled_at < $3
       GROUP BY p.id, p.content, p.scheduled_at, p.status
       ORDER BY p.scheduled_at ASC`,
      [user.userId, start.toISOString(), end.toISOString()]
    );

    const rows = res.rows.map((r) => ({
      id: r.id,
      content: r.content,
      scheduled_at: r.scheduled_at?.toISOString() ?? null,
      platforms: r.platforms ?? [],
      status: r.status,
    }));

    return json(req, rows);
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 401) return errorJson(req, "Unauthorized", 401);
    console.error(e);
    return errorJson(req, "Server error", 500);
  }
}
