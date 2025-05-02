import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Rutas que no requieren autenticación
const publicRoutes = ["/", "/login", "/register", "/api/auth/login", "/api/auth/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas públicas
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith("/api/public"))) {
    return NextResponse.next()
  }

  // Verificar token
  const token = request.cookies.get("token")?.value

  if (!token) {
    // Redirigir a login si es una ruta de página
    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Devolver error 401 si es una ruta de API
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    // Verificar token
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || "default_secret"))

    return NextResponse.next()
  } catch (error) {
    // Token inválido
    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
}

// Configurar las rutas que deben pasar por el middleware
export const config = {
  matcher: [
    // Rutas que requieren autenticación
    "/dashboard/:path*",
    "/profile/:path*",
    "/api/((?!auth/login|auth/register|public).)*",
  ],
}
