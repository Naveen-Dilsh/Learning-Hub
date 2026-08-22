import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

// Next appends internal params like _rsc to RSC/prefetch requests. Those must
// never end up inside callbackUrl, or signin would send the user to a URL that
// returns a flight payload instead of a page.
const INTERNAL_PARAMS = ["_rsc"]

function callbackTarget(nextUrl) {
  const search = new URLSearchParams(nextUrl.search)
  for (const p of INTERNAL_PARAMS) search.delete(p)
  const qs = search.toString()
  return nextUrl.pathname + (qs ? `?${qs}` : "")
}

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const pathname = req.nextUrl.pathname

  // Allow auth routes
  if (pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Redirect to signin if accessing protected routes without auth
  if (!token) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/instructor") ||
      pathname.startsWith("/student") ||
      pathname.startsWith("/admin")
    ) {
      const signin = new URL("/auth/signin", req.url)
      signin.searchParams.set("callbackUrl", callbackTarget(req.nextUrl))
      return NextResponse.redirect(signin)
    }
    return NextResponse.next()
  }

  // Only admins can access admin routes
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    // NOTE: /student/dashboard does not exist - the student landing page is /student
    const fallback = token.role === "INSTRUCTOR" ? "/instructor/dashboard" : "/student"
    return NextResponse.redirect(new URL(fallback, req.url))
  }

  // Redirect students trying to access instructor-only routes
  if (token.role === "STUDENT" && pathname.startsWith("/instructor")) {
    return NextResponse.redirect(new URL("/student", req.url))
  }

  // Redirect instructors trying to access student-only routes
  if (token.role === "INSTRUCTOR" && pathname.startsWith("/student")) {
    return NextResponse.redirect(new URL("/instructor/dashboard", req.url))
  }

  // Redirect ADMIN users trying to access student-only routes
  if (token.role === "ADMIN" && pathname.startsWith("/student")) {
    return NextResponse.redirect(new URL("/instructor/enrollments/pending", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/instructor/:path*", "/student/:path*", "/admin/:path*", "/courses/:path*/watch"],
}
