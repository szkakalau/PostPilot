import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { verifyOAuthState } from "@/lib/jwt";
import { exchangeRedditCode, fetchRedditMe } from "@/lib/reddit-oauth";

function frontendBase(): string {
  const u = process.env.FRONTEND_URL;
  if (!u) throw new Error("FRONTEND_URL is not set");
  return u.replace(/\/$/, "");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let code = searchParams.get("code");
  const state = searchParams.get("state");
  const err = searchParams.get("error");

  const redirectAccounts = (q: string) =>
    NextResponse.redirect(`${frontendBase()}/dashboard/accounts${q}`);

  if (err) {
    return redirectAccounts(`?error=${encodeURIComponent(err)}`);
  }
  if (!code || !state) {
    return redirectAccounts(`?error=${encodeURIComponent("missing_code")}`);
  }

  // Some clients include a trailing "#_" in the code value.
  code = code.replace(/#_$/, "");

  try {
    const oauth = await verifyOAuthState(state);
    if (oauth.provider !== "reddit") {
      return redirectAccounts(`?error=${encodeURIComponent("invalid_state")}`);
    }

    const { userId } = oauth;
    const tokens = await exchangeRedditCode(code);
    const me = await fetchRedditMe(tokens.access_token);

    const expiresAt =
      tokens.expires_in != null ? new Date(Date.now() + tokens.expires_in * 1000) : null;

    const pool = getPool();
    await pool.query(
      `INSERT INTO social_accounts (
         user_id, platform, account_name, account_id, avatar_url,
         access_token, refresh_token, expires_at
       ) VALUES ($1, 'reddit', $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, platform, account_id)
       DO UPDATE SET
         account_name = EXCLUDED.account_name,
         avatar_url = EXCLUDED.avatar_url,
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         expires_at = EXCLUDED.expires_at`,
      [
        userId,
        me.name,
        me.name,
        me.icon_img ?? null,
        tokens.access_token,
        tokens.refresh_token ?? null,
        expiresAt,
      ]
    );

    return redirectAccounts("?connected=reddit");
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "oauth_failed";
    return redirectAccounts(`?error=${encodeURIComponent(msg)}`);
  }
}


