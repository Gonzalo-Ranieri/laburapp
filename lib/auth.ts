import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import prisma from "./db"

interface JwtPayload {
  id: string
  email: string
}

export async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        providerProfile: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error al decodificar token:", error)
    return null
  }
}
