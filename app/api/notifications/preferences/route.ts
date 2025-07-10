import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Obtener preferencias de notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const query = `
      SELECT type, email, push, sms
      FROM "NotificationPreference"
      WHERE "userId" = $1
      ORDER BY type
    `

    const preferences = await db.executeQuery(query, [user.id])

    // Convertir a objeto para facilitar el uso
    const preferencesObj = preferences.reduce((acc: any, pref: any) => {
      acc[pref.type] = {
        email: pref.email,
        push: pref.push,
        sms: pref.sms,
      }
      return acc
    }, {})

    return NextResponse.json(preferencesObj)
  } catch (error) {
    console.error("Error al obtener preferencias:", error)
    return NextResponse.json({ error: "Error al obtener preferencias" }, { status: 500 })
  }
}

// PUT: Actualizar preferencias de notificaciones
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { preferences } = body

    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json({ error: "Formato de preferencias inválido" }, { status: 400 })
    }

    // Actualizar cada tipo de notificación
    for (const [type, settings] of Object.entries(preferences)) {
      const { email, push, sms } = settings as any

      const upsertQuery = `
        INSERT INTO "NotificationPreference" ("id", "userId", "type", "email", "push", "sms")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
        ON CONFLICT ("userId", "type")
        DO UPDATE SET
          email = EXCLUDED.email,
          push = EXCLUDED.push,
          sms = EXCLUDED.sms,
          "updatedAt" = NOW()
      `

      await db.executeQuery(upsertQuery, [user.id, type, email, push, sms])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar preferencias:", error)
    return NextResponse.json({ error: "Error al actualizar preferencias" }, { status: 500 })
  }
}
