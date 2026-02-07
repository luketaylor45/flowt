
import { NextRequest, NextResponse } from "next/server";
import { updateSession, getSession } from "./lib/auth";

export async function middleware(request: NextRequest) {
    // 1. Update session expiration if it exists
    const response = await updateSession(request);

    // 2. Define protected routes
    // Logic: If path is NOT /login or /setup, and NO session, redirect to /login.

    const path = request.nextUrl.pathname;
    const isPublicPath = path === "/login" || path === "/setup" || path.startsWith("/api");

    const session = request.cookies.get("session")?.value;

    if (!session && !isPublicPath) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // If user is logged in and tries to go to login, redirect to dashboard
    if (session && path === "/login") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return response || NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
