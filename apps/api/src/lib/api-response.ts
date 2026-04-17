import { NextResponse } from "next/server";
import { allowedOrigin, withCors } from "./cors";

export function json(
  req: Request,
  data: unknown,
  init?: ResponseInit
): NextResponse {
  const origin = allowedOrigin(req.headers.get("origin"));
  const res = NextResponse.json(data, init);
  return withCors(res, origin);
}

export function errorJson(
  req: Request,
  message: string,
  status: number
): NextResponse {
  return json(req, { error: message }, { status });
}
