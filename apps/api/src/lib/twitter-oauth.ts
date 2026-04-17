import { signOAuthState } from "./jwt";

const AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const ME_URL = "https://api.twitter.com/2/users/me";

const SCOPES = ["tweet.read", "tweet.write", "users.read", "offline.access"].join(" ");

export async function buildTwitterAuthorizeUrl(params: {
  userId: string;
  codeVerifier: string;
  codeChallenge: string;
}): Promise<string> {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("TWITTER_CLIENT_ID or TWITTER_REDIRECT_URI missing");
  }

  const state = await signOAuthState({
    userId: params.userId,
    codeVerifier: params.codeVerifier,
    provider: "twitter",
  });

  const u = new URL(AUTH_URL);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("scope", SCOPES);
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", params.codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");
  return u.toString();
}

export async function exchangeTwitterCode(code: string, codeVerifier: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}> {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("Twitter OAuth env missing");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
    client_id: clientId,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (clientSecret) {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    headers.Authorization = `Basic ${basic}`;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers,
    body,
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Twitter token error: ${res.status} ${t}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }>;
}

export async function fetchTwitterProfile(accessToken: string): Promise<{
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}> {
  const url = new URL(ME_URL);
  url.searchParams.set("user.fields", "profile_image_url,name,username");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Twitter me error: ${res.status} ${t}`);
  }
  const data = (await res.json()) as {
    data?: { id: string; name: string; username: string; profile_image_url?: string };
  };
  if (!data.data) throw new Error("Twitter profile missing");
  const u = data.data;
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    profile_image_url: u.profile_image_url,
  };
}
