import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { sendPushNotification, sendEmailNotification } from "@/lib/notification-service"

// GET: Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const type = searchParams.get("type")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    let query = `
      SELECT id, type, title, message, data, read, "readAt", "createdAt"
      FROM "Notification"
      WHERE "userId" = $1
    `

    const params: any[] = [user.id]

    if (type) {
      query += ` AND type = $${params.length + 1}`
      params.push(type)
    }

    if (unreadOnly) {
      query += ` AND read = false`
    }

    query += ` ORDER BY "createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const notifications = await db.executeQuery(query, params)

    // Obtener conteo total
    let countQuery = `
      SELECT COUNT(*) as total, COUNT(CASE WHEN read = false THEN 1 END) as unread
      FROM "Notification"
      WHERE "userId" = $1
    `

    const countParams: any[] = [user.id]

    if (type) {
      countQuery += ` AND type = $${countParams.length + 1}`
      countParams.push(type)
    }

    const countResult = await db.executeQuery(countQuery, countParams)
    const { total, unread } = countResult[0]

    return NextResponse.json({
      notifications,
      pagination: {
        total: Number.parseInt(total),
        unread: Number.parseInt(unread),
        limit,
        offset,
        pages: Math.ceil(Number.parseInt(total) / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener notificaciones:", error)
    return NextResponse.json({ error: "Error al obtener notificaciones" }, { status: 500 })
  }
}

// POST: Crear una nueva notificación
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, type, title, message, data = {}, sendPush = true, sendEmail = false } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Crear notificación en la base de datos
    const insertQuery = `
      INSERT INTO "Notification" ("id", "userId", "type", "title", "message", "data")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
      RETURNING *
    `

    const notification = await db.executeQuery(insertQuery, [userId, type, title, message, data])

    // Obtener preferencias del usuario
    const preferencesQuery = `
      SELECT email, push, sms
      FROM "NotificationPreference"
      WHERE "userId" = $1 AND type = $2
    `

    const preferences = await db.executeQuery(preferencesQuery, [userId, type])
    const userPrefs = preferences[0] || { email: false, push: true, sms: false }

    // Enviar notificación push si está habilitada
    if (sendPush && userPrefs.push) {
      await sendPushNotification(userId, {
        title,
        message,
        data,
      })
    }

    // Enviar email si está habilitado
    if (sendEmail && userPrefs.email) {
      await sendEmailNotification(userId, {
        subject: title,
        message,
        data,
      })
    }

    return NextResponse.json(notification[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear notificación:", error)
    return NextResponse.json({ error: "Error al crear notificación" }, { status: 500 })
  }
}

// PATCH: Marcar notificaciones como leídas
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead = false } = body

    let query: string
    let params: any[]

    if (markAllAsRead) {
      query = `
        UPDATE "Notification"
        SET read = true, "readAt" = NOW(), "updatedAt" = NOW()
        WHERE "userId" = $1 AND read = false
        RETURNING id
      `
      params = [user.id]
    } else if (notificationIds && Array.isArray(notificationIds)) {
      query = `
        UPDATE "Notification"
        SET read = true, "readAt" = NOW(), "updatedAt" = NOW()
        WHERE "userId" = $1 AND id = ANY($2) AND read = false
        RETURNING id
      `
      params = [user.id, notificationIds]
    } else {
      return NextResponse.json({ error: "Se requiere notificationIds o markAllAsRead" }, { status: 400 })
    }

    const updatedNotifications = await db.executeQuery(query, params)

    return NextResponse.json({
      success: true,
      updatedCount: updatedNotifications.length,
    })
  } catch (error) {
    console.error("Error al marcar notificaciones como leídas:", error)
    return NextResponse.json({ error: "Error al marcar notificaciones como leídas" }, { status: 500 })
  }
}
