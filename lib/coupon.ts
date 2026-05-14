import { randomBytes } from "crypto";

const COUPON_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const COUPON_LENGTH = 6;
const COUPON_PREFIX = "GOTBUN-2X1";

export function generateCouponCode(): string {
  const bytes = randomBytes(COUPON_LENGTH);
  const suffix = Array.from(bytes, (byte) => COUPON_ALPHABET[byte % COUPON_ALPHABET.length]).join("");

  return `${COUPON_PREFIX}-${suffix}`;
}

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}
