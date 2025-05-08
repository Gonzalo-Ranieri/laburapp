import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import { demoUsers, isDemoMode } from "@/lib/demo-mode"

export async function POST(request: Request) {
  try {
    // Obtener el token actual
    const token = cookies().get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 })
    }

    // Verificar el token actual
    try {
      const jwtSecret = process.env.JWT_SECRET || "demo_secret_key_for_preview_environment"
      const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret))

      // Obtener el ID del usuario
      const userId = payload.id as string

      // En modo de demostración, buscar el usuario
      if (isDemoMode()) {
        const user = demoUsers.find((u) => u.id === userId)

        if (!user) {
          return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
        }

        // Crear un nuevo token con expiración renovada
        const newToken = await new SignJWT({
          id: user.id,
          email: user.email,
          name: user.name,
          isProvider: !!user.providerProfile,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("30d") // 30 días
          .sign(new TextEncoder().encode(jwtSecret))

        // Establecer la nueva cookie
        cookies().set({
          name: "token",
          value: newToken,
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30, // 30 días
          sameSite: "lax",
        })

        // Renovar también la cookie de estado
        cookies().set({
          name: "auth_status",
          value: "authenticated",
          httpOnly: false,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30, // 30 días
          sameSite: "lax",
        })

        // Excluir la contraseña de la respuesta
        const { password, ...userWithoutPassword } = user

        return NextResponse.json({
          message: "Sesión renovada exitosamente",
          user: userWithoutPassword,
        })
      } else {
        // En un entorno real, aquí buscaríamos el usuario en la base de datos
        // Pero como estamos en un entorno de demostración, usamos los usuarios de demostración
        const user = demoUsers.find((u) => u.id === userId)

        if (!user) {
          return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
        }

        // Crear un nuevo token con expiración renovada
        const newToken = await new SignJWT({
          id: user.id,
          email: user.email,
          name: user.name,
          isProvider: !!user.providerProfile,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("30d") // 30 días
          .sign(new TextEncoder().encode(jwtSecret))

        // Establecer la nueva cookie
        cookies().set({
          name: "token",
          value: newToken,
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30, // 30 días
          sameSite: "lax",
        })

        // Renovar también la cookie de estado
        cookies().set({
          name: "auth_status",
          value: "authenticated",
          httpOnly: false,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30, // 30 días
          sameSite: "lax",
        })

        // Excluir la contraseña de la respuesta
        const { password, ...userWithoutPassword } = user

        return NextResponse.json({
          message: "Sesión renovada exitosamente",
          user: userWithoutPassword,
        })
      }
    } catch (jwtError) {
      console.error("Error al verificar el token:", jwtError)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error al refrescar la sesión:", error)
    return NextResponse.json(
      {
        error: "Error al refrescar la sesión",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
