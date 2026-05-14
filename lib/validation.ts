export type CouponClaimInput = {
  name: string;
  email: string;
  phone: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
  source?: string;
  campaign?: string;
};

export type ValidationResult =
  | { success: true; data: CouponClaimInput }
  | { success: false; errors: Record<string, string> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeOptionalText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 120) : fallback;
}

function normalizeItalianPhone(value: string): string {
  const compact = value.trim().replace(/[\s().-]/g, "");

  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  return `+39${compact.replace(/^0+/, "")}`;
}

export function validateCouponClaim(body: unknown): ValidationResult {
  const payload = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const rawPhone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const phone = normalizeItalianPhone(rawPhone);
  const privacyConsent = payload.privacyConsent === true;
  const marketingConsent = payload.marketingConsent === true;
  const errors: Record<string, string> = {};

  if (name.length < 2) {
    errors.name = "Inserisci un nome di almeno 2 caratteri.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Inserisci un indirizzo email valido.";
  }

  if (rawPhone.length < 8) {
    errors.phone = "Inserisci un numero di telefono valido.";
  }

  if (!privacyConsent) {
    errors.privacyConsent = "Devi accettare il trattamento dei dati per ricevere il coupon.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      email,
      phone,
      privacyConsent,
      marketingConsent,
      source: normalizeOptionalText(payload.source, "landing"),
      campaign: normalizeOptionalText(payload.campaign, "gotbun_2x1"),
    },
  };
}
