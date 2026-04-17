import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

function secretKey() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return encoder.encode(s);
}

export type JwtPayload = { userId: string; email: string };

export async function signUserJwt(payload: JwtPayload, expiresIn = "30d"): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey());
}

export async function verifyUserJwt(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
  const userId = typeof payload.sub === "string" ? payload.sub : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  if (!userId) throw new Error("Invalid token");
  return { userId, email };
}

/** Short-lived JWT embedding OAuth PKCE verifier (Twitter/LinkedIn). */
export async function signOAuthState(payload: {
  userId: string;
  codeVerifier: string;
  provider: "twitter" | "linkedin" | "reddit";
}): Promise<string> {
  return new SignJWT({
    cv: payload.codeVerifier,
    provider: payload.provider,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey());
}

export async function verifyOAuthState(token: string): Promise<{
  userId: string;
  codeVerifier: string;
  provider: "twitter" | "linkedin" | "reddit";
}> {
  const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
  const userId = typeof payload.sub === "string" ? payload.sub : "";
  const codeVerifier = typeof payload.cv === "string" ? payload.cv : "";
  const provider =
    payload.provider === "linkedin"
      ? "linkedin"
      : payload.provider === "reddit"
        ? "reddit"
        : "twitter";
  if (!userId || !codeVerifier) throw new Error("Invalid OAuth state");
  return { userId, codeVerifier, provider };
}
