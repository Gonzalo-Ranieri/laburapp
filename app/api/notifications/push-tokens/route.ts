import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// POST: Registrar token de push notification
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { token, platform = "WEB" } = body

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 })
    }

    // Desactivar tokens anteriores del mismo usuario y plataforma
    const deactivateQuery = `
      UPDATE "PushToken"
      SET "isActive" = false, "updatedAt" = NOW()
      WHERE "userId" = $1 AND platform = $2 AND "isActive" = true
    `
    await db.executeQuery(deactivateQuery, [user.id, platform])

    // Insertar nuevo token
    const insertQuery = `
      INSERT INTO "PushToken" ("id", "userId", "token", "platform")
      VALUES (gen_random_uuid(), $1, $2, $3)
      ON CONFLICT ("token")
      DO UPDATE SET
        "userId" = EXCLUDED."userId",
        "isActive" = true,
        "updatedAt" = NOW()
      RETURNING id
    `

    const result = await db.executeQuery(insertQuery, [user.id, token, platform])

    return NextResponse.json({ success: true, tokenId: result[0].id })
  } catch (error) {
    console.error("Error al registrar push token:", error)
    return NextResponse.json({ error: "Error al registrar push token" }, { status: 500 })
  }
}

// DELETE: Desactivar token de push notification
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 })
    }

    const updateQuery = `
      UPDATE "PushToken"
      SET "isActive" = false, "updatedAt" = NOW()
      WHERE "userId" = $1 AND token = $2
    `

    await db.executeQuery(updateQuery, [user.id, token])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al desactivar push token:", error)
    return NextResponse.json({ error: "Error al desactivar push token" }, { status: 500 })
  }
}
