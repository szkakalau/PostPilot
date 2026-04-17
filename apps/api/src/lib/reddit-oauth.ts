import { signOAuthState } from "./jwt";

const AUTH_URL = "https://www.reddit.com/api/v1/authorize.compact";
const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const OAUTH_BASE = "https://oauth.reddit.com";

const SCOPES = ["identity", "submit", "read"].join(" ");

export async function buildRedditAuthorizeUrl(params: {
  userId: string;
  codeVerifier: string;
}): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const redirectUri = process.env.REDDIT_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("REDDIT_CLIENT_ID or REDDIT_REDIRECT_URI missing");
  }

  const state = await signOAuthState({
    userId: params.userId,
    codeVerifier: params.codeVerifier,
    provider: "reddit",
  });

  const u = new URL(AUTH_URL);
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("state", state);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("duration", "permanent");
  u.searchParams.set("scope", SCOPES);
  return u.toString();
}

export async function exchangeRedditCode(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const redirectUri = process.env.REDDIT_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Reddit OAuth env missing");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent(),
    },
    body,
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Reddit token error: ${res.status} ${t}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
  }>;
}

export async function fetchRedditMe(accessToken: string): Promise<{
  id?: string;
  name: string;
  icon_img?: string;
}> {
  const res = await fetch(`${OAUTH_BASE}/api/v1/me`, {
    headers: {
      Authorization: `bearer ${accessToken}`,
      "User-Agent": userAgent(),
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Reddit me error: ${res.status} ${t}`);
  }
  return res.json() as Promise<{ id?: string; name: string; icon_img?: string }>;
}

function userAgent(): string {
  return process.env.REDDIT_USER_AGENT || "postpilot/0.1 (by u/postpilot)";
}


