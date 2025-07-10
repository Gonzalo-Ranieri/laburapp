import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Obtener mensajes de una conversación
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: conversationId } = params
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Verificar que el usuario pertenece a la conversación
    const participantQuery = `
      SELECT COUNT(*) as count
      FROM "ConversationParticipant"
      WHERE conversationId = $1 AND userId = $2
    `
    const participantResult = await db.executeQuery(participantQuery, [conversationId, user.id])

    if (Number.parseInt(participantResult[0].count) === 0) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener mensajes
    const messagesQuery = `
      SELECT 
        m.id, m.content, m.attachments, m.readBy, m.createdAt,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'image', u.image
        ) as sender
      FROM "Message" m
      JOIN "User" u ON m.senderId = u.id
      WHERE m.conversationId = $1
      ORDER BY m.createdAt DESC
      LIMIT $2 OFFSET $3
    `

    const messages = await db.executeQuery(messagesQuery, [conversationId, limit, offset])

    // Obtener total para paginación
    const countQuery = `
      SELECT COUNT(*) as count
      FROM "Message"
      WHERE conversationId = $1
    `
    const countResult = await db.executeQuery(countQuery, [conversationId])
    const total = Number.parseInt(countResult[0].count)

    return NextResponse.json({
      messages: messages.reverse(), // Revertir para mostrar en orden cronológico
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener mensajes:", error)
    return NextResponse.json({ error: "Error al obtener mensajes" }, { status: 500 })
  }
}
