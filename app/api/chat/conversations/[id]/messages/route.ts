import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"
import { NotificationService } from "@/lib/notification-service"
import { WebSocketService } from "@/lib/websocket-service"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener mensajes de una conversación
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const conversationId = params.id
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const before = url.searchParams.get("before") // Para paginación por cursor

    // Verificar que el usuario es participante de la conversación
    const participation = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: user.id,
      },
    })

    if (!participation) {
      return NextResponse.json({ error: "No tienes acceso a esta conversación" }, { status: 403 })
    }

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = { conversationId }

    if (before) {
      where.createdAt = { lt: new Date(before) }
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          readBy: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          attachments: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId } }),
    ])

    // Marcar mensajes como leídos
    await prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId: messages[0]?.id || "",
          userId: user.id,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        messageId: messages[0]?.id || "",
        userId: user.id,
        readAt: new Date(),
      },
    })

    // Actualizar último acceso a la conversación
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    })

    return NextResponse.json({
      messages: messages.reverse(), // Ordenar cronológicamente para el frontend
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    })
  } catch (error) {
    console.error("Error obteniendo mensajes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Enviar nuevo mensaje
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const conversationId = params.id
    const body = await request.json()
    const { content, type = "TEXT", attachments = [], replyToId } = body

    // Validaciones
    if (!content && attachments.length === 0) {
      return NextResponse.json({ error: "Contenido o archivos adjuntos requeridos" }, { status: 400 })
    }

    // Verificar participación en la conversación
    const participation = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: user.id,
      },
    })

    if (!participation) {
      return NextResponse.json({ error: "No tienes acceso a esta conversación" }, { status: 403 })
    }

    // Obtener información de la conversación
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 })
    }

    // Crear mensaje en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear mensaje
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId: user.id,
          content,
          type,
          replyToId,
          attachments: {
            create: attachments.map((att: any) => ({
              fileName: att.fileName,
              fileUrl: att.fileUrl,
              fileType: att.fileType,
              fileSize: att.fileSize,
            })),
          },
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          attachments: true,
          replyTo: {
            include: {
              sender: {
                select: { id: true, name: true },
              },
            },
          },
        },
      })

      // Actualizar timestamp de la conversación
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      })

      return message
    })

    // Enviar notificaciones a otros participantes
    const otherParticipants = conversation.participants.filter((p) => p.userId !== user.id)

    for (const participant of otherParticipants) {
      await NotificationService.createNotification({
        userId: participant.userId,
        type: "NEW_MESSAGE",
        title: "Nuevo mensaje",
        message: `${user.name}: ${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`,
        data: {
          conversationId,
          messageId: result.id,
          senderId: user.id,
          senderName: user.name,
        },
        priority: "NORMAL",
      })
    }

    // Enviar mensaje por WebSocket
    WebSocketService.broadcastToConversation(conversationId, {
      type: "NEW_MESSAGE",
      message: result,
      senderId: user.id,
    })

    return NextResponse.json({ message: result }, { status: 201 })
  } catch (error) {
    console.error("Error enviando mensaje:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
