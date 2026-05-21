import { cookies } from "next/headers";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "gotbun_admin_session";
const REMEMBER_COOKIE = "gotbun_admin_remember";

function isAllowedAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const allowList = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowList.length === 0) return true;
  return allowList.includes(email.toLowerCase());
}

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "gotbun-admin-fallback-secret";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function createSessionToken(email: string, maxAgeSec: number): string {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const payload = `${email.toLowerCase()}|${exp}`;
  const sig = sign(payload);
  return `${payload}|${sig}`;
}

function verifySessionToken(token: string | undefined): { email: string; exp: number } | null {
  if (!token) return null;
  const parts = token.split("|");
  if (parts.length !== 3) return null;
  const [email, expRaw, sig] = parts;
  const exp = Number(expRaw);
  if (!email || !exp || !sig) return null;
  const payload = `${email}|${exp}`;
  if (sign(payload) !== sig) return null;
  if (Math.floor(Date.now() / 1000) >= exp) return null;
  return { email, exp };
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anonKey) throw new Error("Missing Supabase public env for admin login.");
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function loginAdmin(email: string, password: string, rememberMe: boolean): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    console.error("DEBUG LOGIN ERROR:", error.message, error.status);
  }
  if (error || !data.user?.email) return false;
  if (!isAllowedAdminEmail(data.user.email)) return false;

  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 12;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(data.user.email, maxAge), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  cookieStore.set(REMEMBER_COOKIE, rememberMe ? "1" : "0", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return true;
}

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = verifySessionToken(token);
  if (!payload) return false;
  return isAllowedAdminEmail(payload.email);
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(REMEMBER_COOKIE);
}
