import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/login", "/register"];
const apiAuthRoutes = ["/api/auth", "/api/register"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuth = !!token;
  const { pathname } = req.nextUrl;

  const isPublicPage = publicRoutes.includes(pathname);
  const isApiAuth = apiAuthRoutes.some((route) => pathname.startsWith(route));

  // ✅ Redirect unauthenticated user to login for protected pages
  if (!isAuth && !isPublicPage && !isApiAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Redirect authenticated user away from /login or /register
  if (isAuth && isPublicPage) {
    return NextResponse.redirect(new URL("/", req.url)); // redirect to home or dashboard
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
