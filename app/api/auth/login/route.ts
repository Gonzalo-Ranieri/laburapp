import { NextResponse } from "next/server"
import { SignJWT } from "jose"

// Usuarios de demostración simplificados
const demoUsers = [
  {
    id: "user-123",
    name: "Usuario Demo",
    email: "usuario@test.com",
    password: "Password123!",
    isProvider: false,
  },
  {
    id: "provider-123",
    name: "Proveedor Demo",
    email: "proveedor@test.com",
    password: "Password123!",
    isProvider: true,
  },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    console.log("Intento de inicio de sesión:", email)

    // Buscar usuario por email (ignorando mayúsculas/minúsculas)
    const user = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      console.log("Usuario no encontrado:", email)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verificar contraseña
    if (user.password !== password) {
      console.log("Contraseña incorrecta para:", email)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    console.log("Inicio de sesión exitoso para:", email, "Es proveedor:", user.isProvider)

    // Crear token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "demo_secret_key_for_preview_environment")
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      isProvider: user.isProvider,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d") // 30 días
      .sign(secret)

    // Determinar URL de redirección
    const redirectUrl = user.isProvider ? "/provider-dashboard" : "/"

    // Devolver el token en la respuesta para que el cliente lo guarde en localStorage
    return NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token: token, // Incluir el token en la respuesta
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isProvider: user.isProvider,
      },
      redirectUrl,
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      {
        error: "Error al iniciar sesión",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
