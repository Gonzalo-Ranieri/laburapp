import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Obtener reseñas (con filtros)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT r.*, u.name as user_name, u.image as user_image, 
      sr.description as service_description, st.name as service_type
      FROM "Review" r
      JOIN "User" u ON r.userId = u.id
      JOIN "ServiceRequest" sr ON r.requestId = sr.id
      JOIN "ServiceType" st ON sr.serviceTypeId = st.id
      WHERE 1=1
    `

    const params: any[] = []

    if (providerId) {
      query += ` AND r."providerId" = $${params.length + 1}`
      params.push(providerId)
    }

    if (userId) {
      query += ` AND r."userId" = $${params.length + 1}`
      params.push(userId)
    }

    query += ` ORDER BY r."createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const reviews = await db.executeQuery(query, params)

    // Obtener total para paginación
    let countQuery = `
      SELECT COUNT(*) FROM "Review" r WHERE 1=1
    `

    const countParams: any[] = []

    if (providerId) {
      countQuery += ` AND r."providerId" = $${countParams.length + 1}`
      countParams.push(providerId)
    }

    if (userId) {
      countQuery += ` AND r."userId" = $${countParams.length + 1}`
      countParams.push(userId)
    }

    const countResult = await db.executeQuery(countQuery, countParams)
    const total = Number.parseInt(countResult[0].count)

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener reseñas:", error)
    return NextResponse.json({ error: "Error al obtener reseñas" }, { status: 500 })
  }
}

// POST: Crear una nueva reseña
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { requestId, rating, comment, images = [] } = body

    if (!requestId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "ID de solicitud y calificación (1-5) son requeridos" }, { status: 400 })
    }

    // Verificar que la solicitud exista y esté completada
    const serviceRequestQuery = `
      SELECT sr.*, r.id as review_id
      FROM "ServiceRequest" sr
      LEFT JOIN "Review" r ON r."requestId" = sr.id
      WHERE sr.id = $1
    `
    const serviceRequestResult = await db.executeQuery(serviceRequestQuery, [requestId])

    if (!serviceRequestResult.length) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    const serviceRequest = serviceRequestResult[0]

    if (serviceRequest.status !== "COMPLETED") {
      return NextResponse.json({ error: "Solo se pueden reseñar servicios completados" }, { status: 400 })
    }

    if (serviceRequest.clientId !== user.id) {
      return NextResponse.json({ error: "Solo el cliente puede dejar una reseña" }, { status: 403 })
    }

    if (serviceRequest.review_id) {
      return NextResponse.json({ error: "Ya existe una reseña para esta solicitud" }, { status: 400 })
    }

    if (!serviceRequest.providerId) {
      return NextResponse.json({ error: "La solicitud no tiene un proveedor asignado" }, { status: 400 })
    }

    // Crear reseña
    const insertReviewQuery = `
      INSERT INTO "Review" ("requestId", "userId", "providerId", "rating", "comment", "images")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    const reviewResult = await db.executeQuery(insertReviewQuery, [
      requestId,
      user.id,
      serviceRequest.providerId,
      rating,
      comment || "",
      images,
    ])

    const review = reviewResult[0]

    // Actualizar calificación promedio del proveedor
    const providerReviewsQuery = `
      SELECT AVG(rating) as average_rating, COUNT(*) as review_count
      FROM "Review"
      WHERE "providerId" = $1
    `
    const providerReviewsResult = await db.executeQuery(providerReviewsQuery, [serviceRequest.providerId])
    const { average_rating, review_count } = providerReviewsResult[0]

    const updateProviderQuery = `
      UPDATE "Provider"
      SET "rating" = $1, "reviewCount" = $2
      WHERE "userId" = $3
    `
    await db.executeQuery(updateProviderQuery, [
      Number.parseFloat(average_rating),
      Number.parseInt(review_count),
      serviceRequest.providerId,
    ])

    // Crear notificación para el proveedor
    const createNotificationQuery = `
      INSERT INTO "Notification" ("userId", "type", "title", "message", "data")
      VALUES ($1, $2, $3, $4, $5)
    `
    await db.executeQuery(createNotificationQuery, [
      serviceRequest.providerId,
      "REVIEW",
      "Nueva reseña recibida",
      `Has recibido una calificación de ${rating} estrellas`,
      JSON.stringify({ reviewId: review.id, requestId }),
    ])

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error al crear reseña:", error)
    return NextResponse.json({ error: "Error al crear reseña" }, { status: 500 })
  }
}
