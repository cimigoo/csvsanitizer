import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { generateApiKey, PLAN_CREDITS, type KeyPayload } from "@/lib/auth";

export const runtime = "nodejs";

const GLOBAL: Record<string, unknown> = globalThis as unknown as Record<string, unknown>;
if (!GLOBAL.__csv_issuedKeys) {
  GLOBAL.__csv_issuedKeys = new Map<string, { key: string; payload: KeyPayload }>();
}
const store: Map<string, { key: string; payload: KeyPayload }> =
  GLOBAL.__csv_issuedKeys as Map<string, { key: string; payload: KeyPayload }>;

export { store as issuedKeys };

interface PaddleEvent {
  event_type?: string;
  data?: {
    id?: string;
    items?: Array<{
      price?: { id?: string; product_id?: string; name?: string };
      quantity?: number;
    }>;
    customer?: { email?: string };
    transaction_id?: string;
    checkout?: { id?: string };
  };
}

function mapPriceToPlan(priceId?: string): KeyPayload["plan"] | null {
  const mapping: Record<string, KeyPayload["plan"]> = {
    [process.env.PADDLE_PRICE_STARTER || "price_starter"]: "starter",
    [process.env.PADDLE_PRICE_PRO || "price_pro"]: "pro",
    [process.env.PADDLE_PRICE_BUSINESS || "price_business"]: "business",
  };
  if (!priceId) return null;
  return mapping[priceId] || null;
}

function verifyPaddleSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  try {
    if (signature.includes("|")) {
      const [providedHmac] = signature.split("|");
      const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
      return providedHmac === expected;
    }
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("[paddle-webhook] PADDLE_WEBHOOK_SECRET not set; accepting in dev mode");
    }

    const rawBody = await req.text();
    const signature = req.headers.get("paddle-signature") || req.headers.get("Paddle-Signature");

    if (secret && !verifyPaddleSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as PaddleEvent;
    const eventType = event.event_type || "";
    const data = event.data || {};

    console.log(`[paddle-webhook] received ${eventType}`);

    const relevant =
      eventType === "transaction.completed" ||
      eventType === "subscription.created" ||
      eventType === "transaction_created" ||
      eventType === "subscription_created";

    if (!relevant) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const email = data.customer?.email || "customer@example.com";

    let plan: KeyPayload["plan"] | null = null;
    const itemPriceId = data.items?.[0]?.price?.id;
    plan = mapPriceToPlan(itemPriceId);

    if (!plan) {
      const name = (data.items?.[0]?.price?.name || data.items?.[0]?.price?.product_id || "").toLowerCase();
      if (name.includes("starter")) plan = "starter";
      else if (name.includes("pro")) plan = "pro";
      else if (name.includes("business")) plan = "business";
    }
    if (!plan) {
      console.warn("[paddle-webhook] could not map event to a plan", data);
      return NextResponse.json({ error: "Could not map purchase to plan" }, { status: 400 });
    }

    const credits = PLAN_CREDITS[plan];
    const apiKey = generateApiKey({ email, plan, credits });

    const reference = data.id || data.transaction_id || data.checkout?.id || `evt_${Date.now()}`;
    store.set(reference, { key: apiKey, payload: { email, plan, credits, issuedAt: Date.now() } });

    console.log(`[paddle-webhook] issued ${plan} key with ${credits} credits for ${email} (ref ${reference})`);

    return NextResponse.json({ received: true, reference });
  } catch (err) {
    console.error("[paddle-webhook] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook error" },
      { status: 500 }
    );
  }
}

/**
 * Paddle Billing sends a verification request (GET/HEAD) when setting up
 * a notification destination. Return 200 to pass the check.
 */
export async function GET() {
  return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
