import pg from "pg";

const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS || 60_000);

async function publishTwitter(content, accessToken) {
  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: content }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Twitter ${res.status}: ${text}`);
  }
  const data = JSON.parse(text);
  return data?.data?.id ?? null;
}

async function publishLinkedIn(content, accessToken, personId) {
  const author = `urn:li:person:${personId}`;
  const body = {
    author,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: content },
        shareMediaCategory: "NONE",
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });
  const respText = await res.text();
  if (!res.ok) {
    throw new Error(`LinkedIn ${res.status}: ${respText}`);
  }
  let id = null;
  try {
    const j = JSON.parse(respText);
    id = j.id ?? null;
  } catch {
    /* ignore */
  }
  return id;
}

async function runOnce(pool) {
  const pending = await pool.query(`
    SELECT pp.id AS pp_id,
           pp.platform,
           pp.post_id,
           p.content,
           sa.access_token,
           sa.account_id AS social_account_external_id
    FROM post_platforms pp
    INNER JOIN posts p ON p.id = pp.post_id
    INNER JOIN social_accounts sa ON sa.id = pp.social_account_id
    WHERE pp.status = 'scheduled'
      AND p.scheduled_at IS NOT NULL
      AND p.scheduled_at <= NOW()
    ORDER BY p.scheduled_at ASC
    LIMIT 50
  `);

  for (const row of pending.rows) {
    try {
      let platformPostId = null;
      if (row.platform === "twitter") {
        platformPostId = await publishTwitter(row.content, row.access_token);
      } else if (row.platform === "linkedin") {
        platformPostId = await publishLinkedIn(
          row.content,
          row.access_token,
          row.social_account_external_id
        );
      } else {
        throw new Error(`Unknown platform: ${row.platform}`);
      }

      const upd = await pool.query(
        `UPDATE post_platforms
         SET status = 'published', platform_post_id = $2, error_message = NULL
         WHERE id = $1 AND status = 'scheduled'
         RETURNING id`,
        [row.pp_id, platformPostId]
      );
      if (upd.rowCount === 0) continue;

      const left = await pool.query(
        `SELECT COUNT(*)::int AS c FROM post_platforms WHERE post_id = $1 AND status NOT IN ('published', 'failed')`,
        [row.post_id]
      );
      if (left.rows[0].c === 0) {
        await pool.query(
          `UPDATE posts SET status = 'published', published_at = COALESCE(published_at, NOW()) WHERE id = $1`,
          [row.post_id]
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await pool.query(
        `UPDATE post_platforms SET status = 'failed', error_message = $2 WHERE id = $1 AND status = 'scheduled'`,
        [row.pp_id, msg]
      );
    }
  }
}

function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: url, max: 5 });
  const tick = async () => {
    try {
      await runOnce(pool);
    } catch (e) {
      console.error("worker tick failed", e);
    }
  };

  tick();
  setInterval(tick, INTERVAL_MS);
}

main();
