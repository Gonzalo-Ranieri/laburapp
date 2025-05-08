"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "Todos los campos son requeridos" }
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "El usuario ya existe" }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    redirect("/login")
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return { error: "Error al registrar usuario" }
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos" }
  }

  try {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        providerProfile: true, // Incluir el perfil de proveedor si existe
      },
    })

    if (!user) {
      return { error: "Credenciales inválidas" }
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return { error: "Credenciales inválidas" }
    }

    // Generar token JWT con jose
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      isProvider: !!user.providerProfile,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || "default_secret"))

    // Guardar token en cookie
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    })

    // Redirigir según el tipo de usuario
    if (user.providerProfile) {
      redirect("/provider/dashboard")
    } else {
      redirect("/")
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return { error: "Error al iniciar sesión" }
  }
}

export async function logout() {
  cookies().delete("token")
  redirect("/login")
}
