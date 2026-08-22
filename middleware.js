import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

// Next.js prefetches every <Link> that scrolls into view. Those are RSC
// requests, and redirecting one makes the router hard-navigate the whole tab to
// the redirect target - so a single stale prefetch can throw a signed-in user
// onto /auth/signin. Fail prefetches quietly instead; the real navigation that
// follows still gets the redirect.
function isPrefetch(req) {
  return (
    req.headers.get("next-router-prefetch") === "1" ||
    req.headers.get("purpose") === "prefetch" ||
    req.headers.get("x-purpose") === "prefetch"
  )
}

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const pathname = req.nextUrl.pathname

  const bounce = (path) => {
    if (isPrefetch(req)) return new NextResponse(null, { status: 204 })
    return NextResponse.redirect(new URL(path, req.url))
  }

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
      // Carry where they were headed so signin can send them back there
      return bounce(`/auth/signin?callbackUrl=${encodeURIComponent(pathname + req.nextUrl.search)}`)
    }
    return NextResponse.next()
  }

  // Only admins can access admin routes
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    const fallback = token.role === "INSTRUCTOR" ? "/instructor/dashboard" : "/student"
    return bounce(fallback)
  }

  // Redirect students trying to access instructor-only routes
  if (token.role === "STUDENT" && pathname.startsWith("/instructor")) {
    return bounce("/student")
  }

  // Redirect instructors trying to access student-only routes
  if (token.role === "INSTRUCTOR" && pathname.startsWith("/student")) {
    return bounce("/instructor/dashboard")
  }

  // Redirect ADMIN users trying to access student-only routes
  if (token.role === "ADMIN" && pathname.startsWith("/student")) {
    return bounce("/instructor/enrollments/pending")
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/instructor/:path*", "/student/:path*", "/admin/:path*", "/courses/:path*/watch"],
}
