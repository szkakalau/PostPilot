import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { verifyOAuthState } from "@/lib/jwt";
import { exchangeLinkedInCode, fetchLinkedInMe } from "@/lib/linkedin-oauth";

function frontendBase(): string {
  const u = process.env.FRONTEND_URL;
  if (!u) throw new Error("FRONTEND_URL is not set");
  return u.replace(/\/$/, "");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
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

  try {
    const oauth = await verifyOAuthState(state);
    if (oauth.provider !== "linkedin") {
      return redirectAccounts(`?error=${encodeURIComponent("invalid_state")}`);
    }
    const { userId, codeVerifier } = oauth;
    const tokens = await exchangeLinkedInCode(code, codeVerifier);
    const me = await fetchLinkedInMe(tokens.access_token);

    const name = [me.localizedFirstName, me.localizedLastName].filter(Boolean).join(" ") || "LinkedIn";
    const avatar =
      me.profilePicture?.displayImage?.split(",").pop()?.trim() ?? null;

    const expiresAt =
      tokens.expires_in != null
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null;

    const pool = getPool();
    await pool.query(
      `INSERT INTO social_accounts (
         user_id, platform, account_name, account_id, avatar_url,
         access_token, refresh_token, expires_at
       ) VALUES ($1, 'linkedin', $2, $3, $4, $5, NULL, $6)
       ON CONFLICT (user_id, platform, account_id)
       DO UPDATE SET
         account_name = EXCLUDED.account_name,
         avatar_url = EXCLUDED.avatar_url,
         access_token = EXCLUDED.access_token,
         expires_at = EXCLUDED.expires_at`,
      [userId, name, me.id, avatar, tokens.access_token, expiresAt]
    );

    return redirectAccounts("?connected=linkedin");
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "oauth_failed";
    return redirectAccounts(`?error=${encodeURIComponent(msg)}`);
  }
}
