import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const session = request.cookies.get("admin_session");

  const isLoginPage = pathname === "/login";
  const isApiLogin = pathname === "/api/login";

  if (isApiLogin) {
    return NextResponse.next();
  }

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};