import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isSubscribed = (req.auth as any)?.isSubscribed === true;

    console.log(`[Middleware] Path: ${nextUrl.pathname}, LoggedIn: ${isLoggedIn}, Subscribed: ${isSubscribed}`);

    // Define route categories
    const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/api");
    const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
    const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/settings") || nextUrl.pathname.startsWith("/subscription");

    // 1. Redirect logged-in users away from root path to dashboard
    if (nextUrl.pathname === "/") {
        if (isLoggedIn) {
            console.log(`[Middleware] Redirecting logged-in user from ${nextUrl.pathname} to /dashboard`);
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        return NextResponse.next();
    }

    // 2. Redirect logged-in users away from auth routes (login/register)
    if (isAuthRoute) {
        if (isLoggedIn) {
            console.log(`[Middleware] Redirecting logged-in user from ${nextUrl.pathname} to /dashboard`);
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        return NextResponse.next();
    }

    // 2. Handle protected routes
    if (isProtectedRoute) {
        if (!isLoggedIn) {
            console.log(`[Middleware] Redirecting unauthenticated user from ${nextUrl.pathname} to /login`);
            return NextResponse.redirect(new URL("/login", nextUrl));
        }

        // 3. Subscription logic for authenticated users
        // If the user HAS a subscription and tries to go to the subscription page, send to dashboard
        if (isSubscribed && nextUrl.pathname === "/subscription") {
            console.log(`[Middleware] Subscribed user on /subscription. Redirecting to /dashboard`);
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }

        // Removed: Redirecting users without plans to /subscription.
        // As per user request, users should have access even if plan is canceled/missing.
    }

    return NextResponse.next();
});

// Configure which routes the middleware should run on
export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
