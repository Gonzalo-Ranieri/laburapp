import type { Server as HTTPServer } from "http"
import { Server as WebSocketServer } from "socket.io"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

let io: WebSocketServer | null = null

export function initializeWebSocketServer(server: HTTPServer) {
  if (io) return io

  io = new WebSocketServer(server, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
    },
  })

  // Middleware para autenticación
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error("Authentication error"))
    }

    try {
      const user = await verifyToken(token)
      if (!user) {
        return next(new Error("Authentication error"))
      }

      // Guardar información del usuario en el socket
      socket.data.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  // Manejo de conexiones
  io.on("connection", (socket) => {
    const user = socket.data.user
    console.log(`Usuario conectado: ${user.name} (${user.id})`)

    // Unirse a sala personal para recibir mensajes directos
    socket.join(`user:${user.id}`)

    // Marcar usuario como online
    updateUserStatus(user.id, true)

    // Escuchar eventos de mensajes
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, attachments = [] } = data

        // Verificar que el usuario pertenece a la conversación
        const isParticipant = await checkConversationParticipant(conversationId, user.id)
        if (!isParticipant) {
          socket.emit("error", { message: "No autorizado para enviar mensajes en esta conversación" })
          return
        }

        // Guardar mensaje en la base de datos
        const message = await saveMessage(conversationId, user.id, content, attachments)

        // Obtener participantes de la conversación
        const participants = await getConversationParticipants(conversationId)

        // Emitir mensaje a todos los participantes
        participants.forEach((participantId) => {
          io?.to(`user:${participantId}`).emit("new_message", {
            ...message,
            sender: {
              id: user.id,
              name: user.name,
              image: user.image,
            },
          })
        })

        // Actualizar última actividad de la conversación
        await updateConversationLastActivity(conversationId)
      } catch (error) {
        console.error("Error al enviar mensaje:", error)
        socket.emit("error", { message: "Error al enviar mensaje" })
      }
    })

    // Escuchar evento de "escribiendo"
    socket.on("typing", async (data) => {
      try {
        const { conversationId, isTyping } = data

        // Verificar que el usuario pertenece a la conversación
        const isParticipant = await checkConversationParticipant(conversationId, user.id)
        if (!isParticipant) return

        // Obtener participantes de la conversación
        const participants = await getConversationParticipants(conversationId)

        // Emitir estado de escritura a todos los participantes excepto el emisor
        participants
          .filter((participantId) => participantId !== user.id)
          .forEach((participantId) => {
            io?.to(`user:${participantId}`).emit("user_typing", {
              conversationId,
              userId: user.id,
              isTyping,
            })
          })
      } catch (error) {
        console.error("Error en evento typing:", error)
      }
    })

    // Escuchar evento de lectura de mensajes
    socket.on("mark_read", async (data) => {
      try {
        const { conversationId, messageId } = data

        // Verificar que el usuario pertenece a la conversación
        const isParticipant = await checkConversationParticipant(conversationId, user.id)
        if (!isParticipant) return

        // Marcar mensajes como leídos
        await markMessagesAsRead(conversationId, user.id, messageId)

        // Obtener participantes de la conversación
        const participants = await getConversationParticipants(conversationId)

        // Notificar a todos los participantes
        participants.forEach((participantId) => {
          io?.to(`user:${participantId}`).emit("messages_read", {
            conversationId,
            userId: user.id,
            messageId,
          })
        })
      } catch (error) {
        console.error("Error al marcar mensajes como leídos:", error)
      }
    })

    // Manejar desconexión
    socket.on("disconnect", () => {
      console.log(`Usuario desconectado: ${user.name} (${user.id})`)
      updateUserStatus(user.id, false)
    })
  })

  return io
}

// Funciones auxiliares para interactuar con la base de datos

async function updateUserStatus(userId: string, isOnline: boolean) {
  try {
    const query = `
      UPDATE "User"
      SET "isOnline" = $1, "lastSeen" = NOW()
      WHERE id = $2
    `
    await db.executeQuery(query, [isOnline, userId])
  } catch (error) {
    console.error("Error al actualizar estado del usuario:", error)
  }
}

async function checkConversationParticipant(conversationId: string, userId: string): Promise<boolean> {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM "ConversationParticipant"
      WHERE "conversationId" = $1 AND "userId" = $2
    `
    const result = await db.executeQuery(query, [conversationId, userId])
    return Number.parseInt(result[0].count) > 0
  } catch (error) {
    console.error("Error al verificar participante:", error)
    return false
  }
}

async function saveMessage(conversationId: string, senderId: string, content: string, attachments: string[] = []) {
  try {
    const query = `
      INSERT INTO "Message" ("conversationId", "senderId", "content", "attachments")
      VALUES ($1, $2, $3, $4)
      RETURNING id, "conversationId", "senderId", content, attachments, "createdAt"
    `
    const result = await db.executeQuery(query, [conversationId, senderId, content, attachments])
    return result[0]
  } catch (error) {
    console.error("Error al guardar mensaje:", error)
    throw error
  }
}

async function getConversationParticipants(conversationId: string): Promise<string[]> {
  try {
    const query = `
      SELECT "userId"
      FROM "ConversationParticipant"
      WHERE "conversationId" = $1
    `
    const result = await db.executeQuery(query, [conversationId])
    return result.map((row: any) => row.userId)
  } catch (error) {
    console.error("Error al obtener participantes:", error)
    return []
  }
}

async function updateConversationLastActivity(conversationId: string) {
  try {
    const query = `
      UPDATE "Conversation"
      SET "lastActivity" = NOW()
      WHERE id = $1
    `
    await db.executeQuery(query, [conversationId])
  } catch (error) {
    console.error("Error al actualizar última actividad:", error)
  }
}

async function markMessagesAsRead(conversationId: string, userId: string, upToMessageId: string) {
  try {
    const query = `
      UPDATE "Message"
      SET "readBy" = array_append("readBy", $1)
      WHERE "conversationId" = $2
        AND NOT ($1 = ANY("readBy"))
        AND "senderId" != $1
        AND id <= $3
    `
    await db.executeQuery(query, [userId, conversationId, upToMessageId])
  } catch (error) {
    console.error("Error al marcar mensajes como leídos:", error)
  }
}

export function getIO(): WebSocketServer | null {
  return io
}
