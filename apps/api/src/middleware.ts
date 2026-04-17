import { NextRequest, NextResponse } from "next/server";
import { allowedOrigin, withCors } from "@/lib/cors";

export function middleware(req: NextRequest) {
  if (req.method === "OPTIONS") {
    const origin = allowedOrigin(req.headers.get("origin"));
    const res = new NextResponse(null, { status: 204 });
    return withCors(res, origin);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
