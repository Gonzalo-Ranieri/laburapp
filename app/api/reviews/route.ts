import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// POST: Crear una nueva reseña
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { requestId, rating, comment } = body

    if (!requestId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "ID de solicitud y calificación (1-5) son requeridos" }, { status: 400 })
    }

    // Verificar que la solicitud exista y esté completada
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { review: true },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    if (serviceRequest.status !== "COMPLETED") {
      return NextResponse.json({ error: "Solo se pueden reseñar servicios completados" }, { status: 400 })
    }

    if (serviceRequest.clientId !== user.id) {
      return NextResponse.json({ error: "Solo el cliente puede dejar una reseña" }, { status: 403 })
    }

    if (serviceRequest.review) {
      return NextResponse.json({ error: "Ya existe una reseña para esta solicitud" }, { status: 400 })
    }

    if (!serviceRequest.providerId) {
      return NextResponse.json({ error: "La solicitud no tiene un proveedor asignado" }, { status: 400 })
    }

    // Crear reseña
    const review = await prisma.review.create({
      data: {
        requestId,
        userId: user.id,
        providerId: serviceRequest.providerId,
        rating,
        comment,
      },
    })

    // Actualizar calificación promedio del proveedor
    const providerReviews = await prisma.review.findMany({
      where: { providerId: serviceRequest.providerId },
    })

    const totalRating = providerReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / providerReviews.length

    await prisma.provider.update({
      where: { userId: serviceRequest.providerId },
      data: {
        rating: averageRating,
        reviewCount: providerReviews.length,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error al crear reseña:", error)
    return NextResponse.json({ error: "Error al crear reseña" }, { status: 500 })
  }
}
