import { NextRequest } from "next/server";
import Stripe from "stripe";
import { requireUser } from "@/lib/auth-request";
import { errorJson, json } from "@/lib/api-response";

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return errorJson(req, "Stripe not configured", 500);
    }
    const frontend = process.env.FRONTEND_URL?.replace(/\/$/, "");
    if (!frontend) {
      return errorJson(req, "FRONTEND_URL missing", 500);
    }

    const priceId = process.env.STRIPE_PRICE_ID || "price_19_month";
    const stripe = new Stripe(secret, { apiVersion: "2025-02-24.acacia" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontend}/dashboard?checkout=success`,
      cancel_url: `${frontend}/dashboard?checkout=cancel`,
      customer_email: user.email || undefined,
      client_reference_id: user.userId,
    });

    return json(req, { checkout_url: session.url });
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 401) return errorJson(req, "Unauthorized", 401);
    console.error(e);
    return errorJson(req, "Server error", 500);
  }
}
