import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")
    const unreadOnly = url.searchParams.get("unreadOnly") === "true"
    const type = url.searchParams.get("type") || ""

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = { userId: user.id }

    if (unreadOnly) {
      where.readAt = null
    }

    if (type) {
      where.type = type
    }

    // Obtener notificaciones
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: user.id, readAt: null },
      }),
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    })
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Crear notificación (sistema interno)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, data = {}, priority = "NORMAL" } = body

    // Validaciones
    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: "Datos requeridos faltantes" }, { status: 400 })
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Crear notificación
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
        priority,
      },
    })

    // Aquí podrías integrar con servicios de push notifications
    // await sendPushNotification(userId, { title, message, data })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error("Error creando notificación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Marcar notificaciones como leídas
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds = [], markAllAsRead = false } = body

    let updateResult

    if (markAllAsRead) {
      // Marcar todas las notificaciones como leídas
      updateResult = await prisma.notification.updateMany({
        where: {
          userId: user.id,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      })
    } else if (notificationIds.length > 0) {
      // Marcar notificaciones específicas como leídas
      updateResult = await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      })
    } else {
      return NextResponse.json({ error: "No se especificaron notificaciones" }, { status: 400 })
    }

    return NextResponse.json({
      message: "Notificaciones marcadas como leídas",
      updatedCount: updateResult.count,
    })
  } catch (error) {
    console.error("Error marcando notificaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
