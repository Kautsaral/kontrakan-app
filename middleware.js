import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const session = request.cookies.get("admin_session")?.value;

  const isLoginPage = pathname === "/login";
  const isApiLogin = pathname === "/api/login";

  if (isApiLogin) {
    return NextResponse.next();
  }

  const isValidSession = await verifySessionToken(session);

  if (!isValidSession && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isValidSession && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
