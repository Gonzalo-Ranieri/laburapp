import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Obtener conversaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const query = `
      SELECT 
        c.id, c.type, c.title, c.lastActivity,
        CASE 
          WHEN c.type = 'DIRECT' THEN (
            SELECT json_build_object(
              'id', u.id,
              'name', u.name,
              'image', u.image,
              'isOnline', u.isOnline,
              'lastSeen', u.lastSeen
            )
            FROM "ConversationParticipant" cp
            JOIN "User" u ON cp.userId = u.id
            WHERE cp.conversationId = c.id AND cp.userId != $1
            LIMIT 1
          )
          ELSE NULL
        END as otherUser,
        (
          SELECT json_build_object(
            'id', m.id,
            'content', m.content,
            'senderId', m.senderId,
            'createdAt', m.createdAt,
            'readBy', m.readBy
          )
          FROM "Message" m
          WHERE m.conversationId = c.id
          ORDER BY m.createdAt DESC
          LIMIT 1
        ) as lastMessage,
        (
          SELECT COUNT(*)
          FROM "Message" m
          WHERE m.conversationId = c.id
          AND NOT ($1 = ANY(m.readBy))
          AND m.senderId != $1
        ) as unreadCount
      FROM "Conversation" c
      JOIN "ConversationParticipant" cp ON c.id = cp.conversationId
      WHERE cp.userId = $1
      ORDER BY c.lastActivity DESC
    `

    const conversations = await db.executeQuery(query, [user.id])

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error al obtener conversaciones:", error)
    return NextResponse.json({ error: "Error al obtener conversaciones" }, { status: 500 })
  }
}

// POST: Crear una nueva conversación
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { participantId, initialMessage } = body

    if (!participantId) {
      return NextResponse.json({ error: "Se requiere ID del participante" }, { status: 400 })
    }

    // Verificar si ya existe una conversación directa entre estos usuarios
    const existingConversationQuery = `
      SELECT c.id
      FROM "Conversation" c
      JOIN "ConversationParticipant" cp1 ON c.id = cp1.conversationId AND cp1.userId = $1
      JOIN "ConversationParticipant" cp2 ON c.id = cp2.conversationId AND cp2.userId = $2
      WHERE c.type = 'DIRECT'
      LIMIT 1
    `

    const existingConversation = await db.executeQuery(existingConversationQuery, [user.id, participantId])

    let conversationId

    if (existingConversation.length > 0) {
      // Usar conversación existente
      conversationId = existingConversation[0].id
    } else {
      // Crear nueva conversación
      const createConversationQuery = `
        INSERT INTO "Conversation" (id, type)
        VALUES (gen_random_uuid(), 'DIRECT')
        RETURNING id
      `
      const newConversation = await db.executeQuery(createConversationQuery, [])
      conversationId = newConversation[0].id

      // Añadir participantes
      const addParticipantsQuery = `
        INSERT INTO "ConversationParticipant" (id, conversationId, userId)
        VALUES 
          (gen_random_uuid(), $1, $2),
          (gen_random_uuid(), $1, $3)
      `
      await db.executeQuery(addParticipantsQuery, [conversationId, user.id, participantId])
    }

    // Si hay un mensaje inicial, enviarlo
    if (initialMessage) {
      const sendMessageQuery = `
        INSERT INTO "Message" (id, conversationId, senderId, content)
        VALUES (gen_random_uuid(), $1, $2, $3)
      `
      await db.executeQuery(sendMessageQuery, [conversationId, user.id, initialMessage])

      // Actualizar última actividad
      const updateActivityQuery = `
        UPDATE "Conversation"
        SET lastActivity = NOW()
        WHERE id = $1
      `
      await db.executeQuery(updateActivityQuery, [conversationId])
    }

    return NextResponse.json({ conversationId }, { status: 201 })
  } catch (error) {
    console.error("Error al crear conversación:", error)
    return NextResponse.json({ error: "Error al crear conversación" }, { status: 500 })
  }
}
