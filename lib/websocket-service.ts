import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export class WebSocketService {
  private static io: SocketIOServer | null = null
  private static connectedUsers = new Map<string, string>() // userId -> socketId

  static initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    })

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error("Token requerido"))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        })

        if (!user) {
          return next(new Error("Usuario no encontrado"))
        }

        socket.data.user = user
        next()
      } catch (error) {
        next(new Error("Token inválido"))
      }
    })

    this.io.on("connection", (socket) => {
      const user = socket.data.user
      console.log(`Usuario conectado: ${user.name} (${user.id})`)

      // Registrar usuario conectado
      this.connectedUsers.set(user.id, socket.id)

      // Unirse a salas de conversaciones del usuario
      this.joinUserConversations(socket, user.id)

      // Manejar eventos
      socket.on("join_conversation", (conversationId) => {
        this.handleJoinConversation(socket, conversationId)
      })

      socket.on("leave_conversation", (conversationId) => {
        socket.leave(`conversation:${conversationId}`)
      })

      socket.on("typing_start", (data) => {
        this.handleTypingStart(socket, data)
      })

      socket.on("typing_stop", (data) => {
        this.handleTypingStop(socket, data)
      })

      socket.on("message_read", (data) => {
        this.handleMessageRead(socket, data)
      })

      socket.on("location_update", (data) => {
        this.handleLocationUpdate(socket, data)
      })

      socket.on("disconnect", () => {
        console.log(`Usuario desconectado: ${user.name}`)
        this.connectedUsers.delete(user.id)
        this.updateUserStatus(user.id, "offline")
      })

      // Actualizar estado del usuario a online
      this.updateUserStatus(user.id, "online")
    })
  }

  private static async joinUserConversations(socket: any, userId: string) {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: { userId },
          },
        },
        select: { id: true },
      })

      for (const conv of conversations) {
        socket.join(`conversation:${conv.id}`)
      }
    } catch (error) {
      console.error("Error uniendo a conversaciones:", error)
    }
  }

  private static async handleJoinConversation(socket: any, conversationId: string) {
    try {
      const userId = socket.data.user.id

      // Verificar que el usuario es participante
      const participation = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId,
        },
      })

      if (participation) {
        socket.join(`conversation:${conversationId}`)

        // Notificar a otros participantes que el usuario se unió
        socket.to(`conversation:${conversationId}`).emit("user_joined", {
          userId,
          userName: socket.data.user.name,
        })
      }
    } catch (error) {
      console.error("Error uniéndose a conversación:", error)
    }
  }

  private static handleTypingStart(socket: any, data: { conversationId: string }) {
    socket.to(`conversation:${data.conversationId}`).emit("typing_start", {
      userId: socket.data.user.id,
      userName: socket.data.user.name,
    })
  }

  private static handleTypingStop(socket: any, data: { conversationId: string }) {
    socket.to(`conversation:${data.conversationId}`).emit("typing_stop", {
      userId: socket.data.user.id,
    })
  }

  private static async handleMessageRead(socket: any, data: { messageId: string; conversationId: string }) {
    try {
      const userId = socket.data.user.id

      // Marcar mensaje como leído
      await prisma.messageRead.upsert({
        where: {
          messageId_userId: {
            messageId: data.messageId,
            userId,
          },
        },
        update: {
          readAt: new Date(),
        },
        create: {
          messageId: data.messageId,
          userId,
          readAt: new Date(),
        },
      })

      // Notificar a otros participantes
      socket.to(`conversation:${data.conversationId}`).emit("message_read", {
        messageId: data.messageId,
        userId,
        readAt: new Date(),
      })
    } catch (error) {
      console.error("Error marcando mensaje como leído:", error)
    }
  }

  private static async handleLocationUpdate(
    socket: any,
    data: { latitude: number; longitude: number; accuracy?: number },
  ) {
    try {
      const userId = socket.data.user.id

      // Actualizar ubicación del usuario
      await prisma.providerLocation.create({
        data: {
          userId,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
        },
      })

      // Notificar a conversaciones activas si es proveedor
      const provider = await prisma.provider.findUnique({
        where: { userId },
      })

      if (provider) {
        // Obtener solicitudes activas del proveedor
        const activeRequests = await prisma.serviceRequest.findMany({
          where: {
            providerId: userId,
            status: { in: ["ACCEPTED", "IN_PROGRESS"] },
          },
          include: {
            client: {
              select: { id: true },
            },
          },
        })

        // Enviar ubicación a clientes con servicios activos
        for (const request of activeRequests) {
          const clientSocketId = this.connectedUsers.get(request.client.id)
          if (clientSocketId) {
            this.io?.to(clientSocketId).emit("provider_location_update", {
              requestId: request.id,
              location: {
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: data.accuracy,
                timestamp: new Date(),
              },
            })
          }
        }
      }
    } catch (error) {
      console.error("Error actualizando ubicación:", error)
    }
  }

  private static async updateUserStatus(userId: string, status: "online" | "offline") {
    try {
      // Aquí podrías actualizar el estado en la base de datos
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: { lastSeen: new Date(), status }
      // })

      // Notificar a contactos sobre el cambio de estado
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: { userId },
          },
        },
        include: {
          participants: {
            where: { userId: { not: userId } },
            select: { userId: true },
          },
        },
      })

      for (const conv of conversations) {
        for (const participant of conv.participants) {
          const socketId = this.connectedUsers.get(participant.userId)
          if (socketId) {
            this.io?.to(socketId).emit("user_status_change", {
              userId,
              status,
              timestamp: new Date(),
            })
          }
        }
      }
    } catch (error) {
      console.error("Error actualizando estado del usuario:", error)
    }
  }

  // Métodos públicos para enviar mensajes
  static broadcastToConversation(conversationId: string, data: any) {
    if (this.io) {
      this.io.to(`conversation:${conversationId}`).emit("message", data)
    }
  }

  static sendToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId)
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data)
    }
  }

  static broadcastServiceUpdate(requestId: string, data: any) {
    if (this.io) {
      this.io.to(`service:${requestId}`).emit("service_update", data)
    }
  }

  static getConnectedUsers() {
    return Array.from(this.connectedUsers.keys())
  }

  static isUserOnline(userId: string) {
    return this.connectedUsers.has(userId)
  }
}
