import { NextResponse } from "next/server";
import { addDays, generateCouponCode } from "@/lib/coupon";
import { validateCouponClaim } from "@/lib/validation";

export const runtime = "nodejs";

const OFFICIAL_ORDER_URL = "https://gotbun.order.app.hd.digital/menus";

type WebhookPayload = {
  event: "coupon_claimed";
  brand: "GotBun Riccione";
  name: string;
  email: string;
  phone: string;
  privacyConsent: true;
  marketingConsent: boolean;
  couponCode: string;
  couponType: "2x1";
  createdAt: string;
  expiresAt: string;
  source: string;
  campaign: string;
};

async function sendWebhook(payload: WebhookPayload): Promise<boolean> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("N8N_WEBHOOK_URL is not configured. Coupon generated without webhook delivery.");
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.warn(`n8n webhook returned ${response.status} ${response.statusText}: ${responseText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("n8n webhook delivery failed", error);
    return false;
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Richiesta non valida. Riprova tra poco." },
      { status: 400 },
    );
  }

  const validation = validateCouponClaim(body);

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: "Controlla i dati inseriti.", errors: validation.errors },
      { status: 400 },
    );
  }

  const createdAtDate = new Date();
  const expiresAtDate = addDays(createdAtDate, 14);
  const createdAt = createdAtDate.toISOString();
  const expiresAt = expiresAtDate.toISOString();
  const couponCode = generateCouponCode();
  const claim = validation.data;

  const webhookPayload: WebhookPayload = {
    event: "coupon_claimed",
    brand: "GotBun Riccione",
    name: claim.name,
    email: claim.email,
    phone: claim.phone,
    privacyConsent: true,
    marketingConsent: claim.marketingConsent,
    couponCode,
    couponType: "2x1",
    createdAt,
    expiresAt,
    source: claim.source ?? "landing",
    campaign: claim.campaign ?? "gotbun_2x1",
  };

  const webhookSent = await sendWebhook(webhookPayload);

  return NextResponse.json({
    success: true,
    couponCode,
    expiresAt,
    officialOrderUrl: OFFICIAL_ORDER_URL,
    webhookSent,
  });
}
