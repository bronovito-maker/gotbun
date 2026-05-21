import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase() ?? "";
  const { pathname } = request.nextUrl;

  const sessionResponse = await updateSession(request);
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const hasAdminSessionCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name === "gotbun_admin_session");

  if (isAdminRoute && !hasAdminSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-login";
    const redirectResponse = NextResponse.redirect(url);
    sessionResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  if (host === "promo.gotbunriccione.it" && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/promo";
    return NextResponse.rewrite(url, sessionResponse);
  }

  return sessionResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
