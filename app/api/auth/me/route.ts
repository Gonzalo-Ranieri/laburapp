import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

export async function GET(request: Request) {
  try {
    // Obtener token del encabezado Authorization
    const authHeader = request.headers.get("Authorization")
    let token = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }

    // Si no hay token, devolver no autenticado
    if (!token) {
      console.log("API /me: No hay token")
      return NextResponse.json({ authenticated: false, user: null })
    }

    // Verificar token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "demo_secret_key_for_preview_environment")

    try {
      const { payload } = await jwtVerify(token, secret)

      // Devolver información del usuario
      return NextResponse.json({
        authenticated: true,
        user: {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          isProvider: payload.isProvider,
        },
      })
    } catch (error) {
      console.error("Error verificando token:", error)
      return NextResponse.json({ authenticated: false, user: null })
    }
  } catch (error) {
    console.error("Error en /api/auth/me:", error)
    return NextResponse.json({ authenticated: false, user: null })
  }
}
