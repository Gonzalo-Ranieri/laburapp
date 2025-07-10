import { type NextRequest, NextResponse } from "next/server"

/**
 * Middleware básico: simplemente continúa la solicitud.
 * Úsalo como punto de partida para futuras reglas.
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  // Evita procesar archivos estáticos, imágenes optimizadas y favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
