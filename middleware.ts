import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Admin routes
    if (pathname.startsWith("/admin")) {
      if (token?.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // College routes
    if (pathname.startsWith("/college")) {
      if (token?.role !== UserRole.COLLEGE && token?.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Department routes
    if (pathname.startsWith("/department")) {
      if (token?.role !== UserRole.DEPARTMENT && token?.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Teacher routes
    if (pathname.startsWith("/teacher")) {
      if (token?.role !== UserRole.TEACHER && token?.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Assistant routes
    if (pathname.startsWith("/assistant")) {
      if (token?.role !== UserRole.ASSISTANT && token?.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/college/:path*",
    "/department/:path*",
    "/teacher/:path*",
    "/assistant/:path*",
    "/dashboard/:path*",
  ],
}
