import { NextResponse } from "next/server";

const ALLOW_HEADERS = "Authorization, Content-Type";
const ALLOW_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";

export function withCors(res: NextResponse, origin: string | null): NextResponse {
  if (origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  } else {
    res.headers.set("Access-Control-Allow-Origin", "*");
  }
  res.headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
  res.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
  res.headers.set("Access-Control-Max-Age", "86400");
  return res;
}

export function allowedOrigin(requestOrigin: string | null): string | null {
  const allow = process.env.CORS_ORIGIN;
  if (!allow || allow === "*") return requestOrigin;
  const list = allow.split(",").map((s) => s.trim());
  if (!requestOrigin) return list[0] ?? null;
  if (list.includes(requestOrigin)) return requestOrigin;
  return list[0] ?? null;
}
