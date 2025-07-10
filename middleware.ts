import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware básico que permite todas las rutas
export function middleware(request: NextRequest) {
  // Por ahora, simplemente permitir todas las requests
  return NextResponse.next()
}

// Configurar qué rutas debe procesar el middleware
export const config = {
  // Excluir archivos estáticos y API routes que no necesitan middleware
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
