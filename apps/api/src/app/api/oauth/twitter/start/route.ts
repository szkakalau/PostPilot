import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth-request";
import { generatePkcePair } from "@/lib/pkce";
import { buildTwitterAuthorizeUrl } from "@/lib/twitter-oauth";
import { errorJson, json } from "@/lib/api-response";

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { codeVerifier, codeChallenge } = generatePkcePair();
    const url = await buildTwitterAuthorizeUrl({
      userId: user.userId,
      codeVerifier,
      codeChallenge,
    });
    return json(req, { url });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 401) return errorJson(req, "Unauthorized", 401);
    console.error(e);
    return errorJson(req, err.message || "Server error", 500);
  }
}
