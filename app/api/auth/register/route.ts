import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validación básica
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await sql`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const userId = uuidv4()
    const now = new Date()

    await sql`
      INSERT INTO "User" (id, name, email, password, "createdAt", "updatedAt")
      VALUES (${userId}, ${name}, ${email}, ${hashedPassword}, ${now}, ${now})
    `

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
