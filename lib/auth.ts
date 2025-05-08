import type { NextRequest } from "next/server"
import type { cookies } from "next/headers"
import { sql } from "./db"
import { jwtVerify } from "jose"

// Función para obtener el usuario a partir del token JWT
export async function getUserFromToken(request: NextRequest | Request) {
  let token: string | undefined

  // Manejar tanto NextRequest como Request estándar
  if ("cookies" in request && typeof request.cookies.get === "function") {
    // Es un NextRequest
    token = request.cookies.get("token")?.value
    console.log("getUserFromToken: Token obtenido de NextRequest", !!token)
  } else {
    // Es un Request estándar
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split("=")
          acc[key] = value
          return acc
        },
        {} as Record<string, string>,
      )

      token = cookies["token"]
      console.log("getUserFromToken: Token obtenido de Request estándar", !!token)
    }
  }

  if (!token) {
    console.log("getUserFromToken: No se encontró token")
    return null
  }

  try {
    // Usar jose en lugar de jsonwebtoken
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "demo_secret_key_for_preview_environment")
    const { payload } = await jwtVerify(token, secret)

    console.log("getUserFromToken: Token verificado para usuario", payload.id)

    // En modo de demostración, podemos devolver un usuario de demostración
    if (process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      console.log("getUserFromToken: Usando modo de demostración")

      // Si es un proveedor en modo demo
      if (payload.isProvider === true) {
        return {
          id: payload.id || "provider-123",
          name: payload.name || "Proveedor Demo",
          email: payload.email || "proveedor@test.com",
          image: "/placeholder.svg?height=40&width=40",
          providerProfile: {
            id: "provider-profile-123",
            userId: payload.id || "provider-123",
            serviceTypeId: "service-type-123",
            rating: 4.5,
            reviewCount: 27,
            isAvailable: true,
          },
        }
      }

      // Usuario normal en modo demo
      return {
        id: payload.id || "user-123",
        name: payload.name || "Usuario Demo",
        email: payload.email || "usuario@test.com",
        image: "/placeholder.svg?height=40&width=40",
        providerProfile: null,
      }
    }

    const users = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.image,
        u.phone,
        (SELECT json_build_object(
          'id', p.id,
          'userId', p."userId",
          'serviceTypeId', p."serviceTypeId",
          'rating', p.rating,
          'reviewCount', p."reviewCount",
          'isAvailable', p."isAvailable"
        ) FROM "Provider" p WHERE p."userId" = u.id) as "providerProfile"
      FROM "User" u
      WHERE u.id = ${payload.id}
      LIMIT 1
    `

    if (users.length === 0) {
      console.log("getUserFromToken: Usuario no encontrado en la base de datos")
      return null
    }

    console.log("getUserFromToken: Usuario encontrado en la base de datos", users[0].name)
    return users[0]
  } catch (error) {
    console.error("Error al obtener usuario del token:", error)
    return null
  }
}

// Función para obtener el usuario a partir de una cookie
export async function getUserFromCookie(cookieStore: ReturnType<typeof cookies>) {
  const token = cookieStore.get("token")?.value

  if (!token) {
    return null
  }

  try {
    // Usar jose en lugar de jsonwebtoken
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secret")
    const { payload } = await jwtVerify(token, secret)

    // En modo de demostración, podemos devolver un usuario de demostración
    if (process.env.DEMO_MODE === "true") {
      return {
        id: payload.id || "provider-123",
        name: "Proveedor Demo",
        email: "proveedor@test.com",
        image: "/placeholder.svg?height=40&width=40",
        providerProfile: {
          id: "provider-profile-123",
          userId: "provider-123",
          serviceTypeId: "service-type-123",
          rating: 4.5,
          reviewCount: 27,
          isAvailable: true,
        },
      }
    }

    const users = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.image,
        u.phone,
        (SELECT json_build_object(
          'id', p.id,
          'userId', p."userId",
          'serviceTypeId', p."serviceTypeId",
          'rating', p.rating,
          'reviewCount', p."reviewCount",
          'isAvailable', p."isAvailable"
        ) FROM "Provider" p WHERE p."userId" = u.id) as "providerProfile"
      FROM "User" u
      WHERE u.id = ${payload.id}
      LIMIT 1
    `

    if (users.length === 0) {
      return null
    }

    return users[0]
  } catch (error) {
    console.error("Error al obtener usuario de la cookie:", error)
    return null
  }
}

// Alias de getUserFromToken para mantener compatibilidad
export const getUserFromRequest = getUserFromToken
