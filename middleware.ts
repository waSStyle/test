import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Define protected routes that require authentication
  const protectedPaths = ["/applications", "/skin-manager", "/skin-builder", "/profile"]

  // Define admin routes that require admin role
  const adminPaths = ["/admin"]

  const path = request.nextUrl.pathname

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  // Check if the path is admin-only
  const isAdminPath = adminPaths.some((adminPath) => path === adminPath || path.startsWith(`${adminPath}/`))

  // If it's a protected path and the user is not authenticated, redirect to login
  if (isProtectedPath && !token) {
    const url = new URL(`/login`, request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // If it's an admin path and the user is not an admin, redirect to home
  if (isAdminPath && (!token || !token.roles?.includes("admin"))) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/applications/:path*", "/skin-manager/:path*", "/skin-builder/:path*", "/profile/:path*", "/admin/:path*"],
}

