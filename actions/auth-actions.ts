"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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
    })

    if (!user) {
      return { error: "Credenciales inválidas" }
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return { error: "Credenciales inválidas" }
    }

    if (!passwordMatch) {
      return { error: "Credenciales inválidas" }
    }

    // Generar token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" })

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

    redirect("/")
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return { error: "Error al iniciar sesión" }
  }
}

export async function logout() {
  cookies().delete("token")
  redirect("/login")
}
