import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const pathname = req.nextUrl.pathname

  // Allow auth routes
  if (pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Redirect to signin if accessing protected routes without auth
  if (!token) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/instructor") || pathname.startsWith("/student")) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
    return NextResponse.next()
  }

  // Redirect students trying to access instructor-only routes
  if (token.role === "STUDENT" && pathname.startsWith("/instructor")) {
    return NextResponse.redirect(new URL("/student/dashboard", req.url))
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
  matcher: ["/dashboard/:path*", "/instructor/:path*", "/student/:path*", "/courses/:path*/watch"],
}
