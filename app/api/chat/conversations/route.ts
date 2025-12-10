import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"
import { NotificationService } from "@/lib/notification-service"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener conversaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")
    const search = url.searchParams.get("search") || ""

    const skip = (page - 1) * limit

    // Construir filtros de búsqueda
    const where: any = {
      participants: {
        some: { userId: user.id },
      },
    }

    if (search) {
      where.OR = [
        {
          participants: {
            some: {
              user: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
        {
          messages: {
            some: {
              content: { contains: search, mode: "insensitive" },
            },
          },
        },
      ]
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  providerProfile: {
                    select: {
                      rating: true,
                      isAvailable: true,
                    },
                  },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, name: true, image: true },
              },
            },
          },
          serviceRequest: {
            select: {
              id: true,
              status: true,
              serviceType: {
                select: { name: true, icon: true },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: user.id },
                  readAt: null,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.conversation.count({ where }),
    ])

    // Formatear conversaciones para el frontend
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find((p) => p.userId !== user.id)
      const lastMessage = conv.messages[0]

      return {
        id: conv.id,
        type: conv.type,
        title: conv.title,
        participant: otherParticipant?.user,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              type: lastMessage.type,
              createdAt: lastMessage.createdAt,
              sender: lastMessage.sender,
              isOwn: lastMessage.senderId === user.id,
            }
          : null,
        unreadCount: conv._count.messages,
        serviceRequest: conv.serviceRequest,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      }
    })

    return NextResponse.json({
      conversations: formattedConversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error obteniendo conversaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Crear nueva conversación
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { participantId, serviceRequestId, type = "DIRECT", title, initialMessage } = body

    // Validaciones
    if (!participantId) {
      return NextResponse.json({ error: "ID del participante requerido" }, { status: 400 })
    }

    if (participantId === user.id) {
      return NextResponse.json({ error: "No puedes crear una conversación contigo mismo" }, { status: 400 })
    }

    // Verificar que el participante existe
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
    })

    if (!participant) {
      return NextResponse.json({ error: "Participante no encontrado" }, { status: 404 })
    }

    // Verificar si ya existe una conversación entre estos usuarios
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: "DIRECT",
        serviceRequestId: serviceRequestId || null,
        participants: {
          every: {
            userId: { in: [user.id, participantId] },
          },
        },
      },
      include: {
        participants: true,
      },
    })

    if (existingConversation && existingConversation.participants.length === 2) {
      return NextResponse.json({
        conversation: { id: existingConversation.id },
        message: "Conversación ya existe",
      })
    }

    // Crear nueva conversación
    const conversation = await prisma.conversation.create({
      data: {
        type,
        title: title || `Chat con ${participant.name}`,
        serviceRequestId,
        participants: {
          create: [
            { userId: user.id, role: "MEMBER" },
            { userId: participantId, role: "MEMBER" },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    // Enviar mensaje inicial si se proporciona
    if (initialMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          content: initialMessage,
          type: "TEXT",
        },
      })

      // Notificar al otro participante
      await NotificationService.createNotification({
        userId: participantId,
        type: "NEW_MESSAGE",
        title: "Nuevo mensaje",
        message: `${user.name}: ${initialMessage.substring(0, 50)}...`,
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          senderName: user.name,
        },
        priority: "NORMAL",
      })
    }

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
    console.error("Error creando conversación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
