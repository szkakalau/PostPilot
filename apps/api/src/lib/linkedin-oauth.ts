import { signOAuthState } from "./jwt";

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";

const SCOPES = ["w_member_social", "r_liteprofile"].join(" ");

export async function buildLinkedInAuthorizeUrl(params: {
  userId: string;
  codeVerifier: string;
  codeChallenge: string;
}): Promise<string> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("LINKEDIN_CLIENT_ID or LINKEDIN_REDIRECT_URI missing");
  }

  const state = await signOAuthState({
    userId: params.userId,
    codeVerifier: params.codeVerifier,
    provider: "linkedin",
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

export async function exchangeLinkedInCode(code: string, codeVerifier: string): Promise<{
  access_token: string;
  expires_in?: number;
}> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("LinkedIn OAuth env missing");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: codeVerifier,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LinkedIn token error: ${res.status} ${t}`);
  }

  return res.json() as Promise<{ access_token: string; expires_in?: number }>;
}

export async function fetchLinkedInMe(accessToken: string): Promise<{
  id: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  profilePicture?: { displayImage?: string };
}> {
  const res = await fetch("https://api.linkedin.com/v2/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LinkedIn me error: ${res.status} ${t}`);
  }
  return res.json() as Promise<{
    id: string;
    localizedFirstName?: string;
    localizedLastName?: string;
    profilePicture?: { displayImage?: string };
  }>;
}
