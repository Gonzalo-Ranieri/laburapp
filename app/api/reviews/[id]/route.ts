import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Obtener una reseña específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const query = `
      SELECT r.*, u.name as user_name, u.image as user_image, 
      sr.description as service_description, st.name as service_type
      FROM "Review" r
      JOIN "User" u ON r.userId = u.id
      JOIN "ServiceRequest" sr ON r.requestId = sr.id
      JOIN "ServiceType" st ON sr.serviceTypeId = st.id
      WHERE r.id = $1
    `

    const result = await db.executeQuery(query, [id])

    if (!result.length) {
      return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error al obtener reseña:", error)
    return NextResponse.json({ error: "Error al obtener reseña" }, { status: 500 })
  }
}

// PUT: Actualizar una reseña
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { rating, comment, images } = body

    // Verificar que la reseña exista y pertenezca al usuario
    const reviewQuery = `SELECT * FROM "Review" WHERE id = $1`
    const reviewResult = await db.executeQuery(reviewQuery, [id])

    if (!reviewResult.length) {
      return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 })
    }

    const review = reviewResult[0]

    if (review.userId !== user.id) {
      return NextResponse.json({ error: "No autorizado para editar esta reseña" }, { status: 403 })
    }

    // Verificar que no hayan pasado más de 7 días desde la creación
    const createdAt = new Date(review.createdAt)
    const now = new Date()
    const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24)

    if (daysDiff > 7) {
      return NextResponse.json({ error: "No se puede editar una reseña después de 7 días" }, { status: 400 })
    }

    // Actualizar reseña
    const updateQuery = `
      UPDATE "Review"
      SET rating = $1, comment = $2, images = $3, "updatedAt" = NOW()
      WHERE id = $4
      RETURNING *
    `

    const updateResult = await db.executeQuery(updateQuery, [
      rating || review.rating,
      comment || review.comment,
      images || review.images,
      id,
    ])

    // Actualizar calificación promedio del proveedor
    const providerReviewsQuery = `
      SELECT AVG(rating) as average_rating, COUNT(*) as review_count
      FROM "Review"
      WHERE "providerId" = $1
    `
    const providerReviewsResult = await db.executeQuery(providerReviewsQuery, [review.providerId])
    const { average_rating, review_count } = providerReviewsResult[0]

    const updateProviderQuery = `
      UPDATE "Provider"
      SET "rating" = $1, "reviewCount" = $2
      WHERE "userId" = $3
    `
    await db.executeQuery(updateProviderQuery, [
      Number.parseFloat(average_rating),
      Number.parseInt(review_count),
      review.providerId,
    ])

    return NextResponse.json(updateResult[0])
  } catch (error) {
    console.error("Error al actualizar reseña:", error)
    return NextResponse.json({ error: "Error al actualizar reseña" }, { status: 500 })
  }
}

// DELETE: Eliminar una reseña (solo administradores o el propio usuario)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params

    // Verificar que la reseña exista
    const reviewQuery = `SELECT * FROM "Review" WHERE id = $1`
    const reviewResult = await db.executeQuery(reviewQuery, [id])

    if (!reviewResult.length) {
      return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 })
    }

    const review = reviewResult[0]

    // Solo el autor o un administrador puede eliminar
    if (review.userId !== user.id && !user.isAdmin) {
      return NextResponse.json({ error: "No autorizado para eliminar esta reseña" }, { status: 403 })
    }

    // Eliminar reseña
    await db.executeQuery(`DELETE FROM "Review" WHERE id = $1`, [id])

    // Actualizar calificación promedio del proveedor
    const providerReviewsQuery = `
      SELECT AVG(rating) as average_rating, COUNT(*) as review_count
      FROM "Review"
      WHERE "providerId" = $1
    `
    const providerReviewsResult = await db.executeQuery(providerReviewsQuery, [review.providerId])

    if (providerReviewsResult.length && providerReviewsResult[0].review_count > 0) {
      const { average_rating, review_count } = providerReviewsResult[0]

      const updateProviderQuery = `
        UPDATE "Provider"
        SET "rating" = $1, "reviewCount" = $2
        WHERE "userId" = $3
      `
      await db.executeQuery(updateProviderQuery, [
        Number.parseFloat(average_rating),
        Number.parseInt(review_count),
        review.providerId,
      ])
    } else {
      // Si no hay más reseñas, resetear calificación
      const updateProviderQuery = `
        UPDATE "Provider"
        SET "rating" = 0, "reviewCount" = 0
        WHERE "userId" = $1
      `
      await db.executeQuery(updateProviderQuery, [review.providerId])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar reseña:", error)
    return NextResponse.json({ error: "Error al eliminar reseña" }, { status: 500 })
  }
}
