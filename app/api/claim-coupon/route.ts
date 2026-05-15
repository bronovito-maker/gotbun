import { NextResponse } from "next/server";
import { addDays, generateCouponCode, generateRedeemToken } from "@/lib/coupon";
import { validateCouponClaim } from "@/lib/validation";

export const runtime = "nodejs";

const PROMO_DAYS = "lunedi-giovedi";
const PROMO_HOURS = "18:30-22:30";
const DEFAULT_QR_IMAGE_SIZE = "420x420";

type WebhookPayload = {
  event: "coupon_claimed";
  brand: "GotBun Riccione";
  name: string;
  email: string;
  phone: string;
  privacyConsent: true;
  marketingConsent: boolean;
  couponCode: string;
  redeemToken: string;
  redeemUrl: string;
  qrContent: string;
  qrImageUrl: string;
  status: "Active";
  couponType: "2x1";
  redemptionMode: "in_store";
  usageLimit: 1;
  promoDays: typeof PROMO_DAYS;
  promoHours: typeof PROMO_HOURS;
  createdAt: string;
  expiresAt: string;
  source: string;
  campaign: string;
};

function appendRedeemParams(baseUrl: string, couponCode: string, redeemToken: string): string {
  const redeemUrl = new URL(baseUrl);
  redeemUrl.searchParams.set("code", couponCode);
  redeemUrl.searchParams.set("token", redeemToken);
  return redeemUrl.toString();
}

function buildRedeemUrl(request: Request, couponCode: string, redeemToken: string): string {
  const configuredRedeemUrl = process.env.N8N_REDEEM_WEBHOOK_URL;

  if (configuredRedeemUrl) {
    return appendRedeemParams(configuredRedeemUrl, couponCode, redeemToken);
  }

  const requestUrl = new URL(request.url);
  return appendRedeemParams(`${requestUrl.origin}/redeem`, couponCode, redeemToken);
}

function buildQrImageUrl(qrContent: string): string {
  const configuredQrImageBaseUrl = process.env.QR_IMAGE_BASE_URL;

  if (configuredQrImageBaseUrl) {
    const qrImageUrl = new URL(configuredQrImageBaseUrl);
    qrImageUrl.searchParams.set("data", qrContent);
    return qrImageUrl.toString();
  }

  const qrImageUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
  qrImageUrl.searchParams.set("size", DEFAULT_QR_IMAGE_SIZE);
  qrImageUrl.searchParams.set("data", qrContent);
  return qrImageUrl.toString();
}

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
  const redeemToken = generateRedeemToken();
  const redeemUrl = buildRedeemUrl(request, couponCode, redeemToken);
  const qrContent = redeemUrl;
  const qrImageUrl = buildQrImageUrl(qrContent);
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
    redeemToken,
    redeemUrl,
    qrContent,
    qrImageUrl,
    status: "Active",
    couponType: "2x1",
    redemptionMode: "in_store",
    usageLimit: 1,
    promoDays: PROMO_DAYS,
    promoHours: PROMO_HOURS,
    createdAt,
    expiresAt,
    source: claim.source ?? "landing",
    campaign: claim.campaign ?? "gotbun_tavoli_2x1",
  };

  const webhookSent = await sendWebhook(webhookPayload);

  return NextResponse.json({
    success: true,
    couponCode,
    qrContent,
    qrImageUrl,
    expiresAt,
    redemptionMode: "in_store",
    promoDays: PROMO_DAYS,
    promoHours: PROMO_HOURS,
    webhookSent,
  });
}
