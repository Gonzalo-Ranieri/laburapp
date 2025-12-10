import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JWTPayload {
  userId: string
  email: string
  name: string
  iat?: number
  exp?: number
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  image?: string
}

export async function signToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const payload = await verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        image: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error getting user from token:", error)
    return null
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    return await getUserFromToken(token)
  } catch (error) {
    console.error("Error getting user from request:", error)
    return null
  }
}

export async function getUserFromCookies(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value
    if (!token) return null

    return await getUserFromToken(token)
  } catch (error) {
    console.error("Error getting user from cookies:", error)
    return null
  }
}

export const getUserFromCookie = getUserFromCookies

export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getUserFromRequest(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function createSession(user: User): Promise<string> {
  const payload: Omit<JWTPayload, "iat" | "exp"> = {
    userId: user.id,
    email: user.email,
    name: user.name,
  }

  return await signToken(payload)
}
