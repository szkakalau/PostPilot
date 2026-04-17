import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth-request";
import { getPool } from "@/lib/db";
import { errorJson, json } from "@/lib/api-response";

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = (await req.json()) as {
      content?: string;
      scheduledAt?: string | null;
      socialAccountIds?: string[];
    };

    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) {
      return errorJson(req, "content is required", 400);
    }

    const ids = Array.isArray(body.socialAccountIds) ? body.socialAccountIds : [];
    let scheduledAt: Date | null =
      body.scheduledAt != null && body.scheduledAt !== ""
        ? new Date(body.scheduledAt)
        : null;
    if (scheduledAt && Number.isNaN(scheduledAt.getTime())) {
      return errorJson(req, "invalid scheduledAt", 400);
    }
    if (ids.length > 0 && !scheduledAt) {
      scheduledAt = new Date();
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const postStatus = scheduledAt ? "scheduled" : "draft";
      const postRes = await client.query<{ id: string }>(
        `INSERT INTO posts (user_id, content, status, scheduled_at)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [user.userId, content, postStatus, scheduledAt]
      );
      const postId = postRes.rows[0].id;

      if (ids.length > 0) {
        const acc = await client.query<{ id: string; platform: string }>(
          `SELECT id, platform FROM social_accounts
           WHERE user_id = $1 AND id = ANY($2::uuid[])`,
          [user.userId, ids]
        );
        if (acc.rows.length !== ids.length) {
          await client.query("ROLLBACK");
          return errorJson(req, "Invalid social account selection", 400);
        }

        for (const row of acc.rows) {
          await client.query(
            `INSERT INTO post_platforms (post_id, social_account_id, platform, status)
             VALUES ($1, $2, $3, 'scheduled')`,
            [postId, row.id, row.platform]
          );
        }
      }

      await client.query("COMMIT");
      return json(req, { id: postId });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 401) return errorJson(req, "Unauthorized", 401);
    console.error(e);
    return errorJson(req, "Server error", 500);
  }
}
