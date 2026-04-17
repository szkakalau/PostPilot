import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth-request";
import { generateSocialPosts } from "@/lib/deepseek";
import { errorJson, json } from "@/lib/api-response";

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    await requireUser(req);
    const body = (await req.json()) as { prompt?: string };
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return errorJson(req, "prompt is required", 400);
    }

    const posts = await generateSocialPosts(prompt);
    return json(req, { posts });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 401) return errorJson(req, "Unauthorized", 401);
    console.error(e);
    return errorJson(req, err.message || "Server error", 500);
  }
}
