import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener reseñas
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const providerId = url.searchParams.get("providerId") || ""
    const userId = url.searchParams.get("userId") || ""
    const minRating = Number.parseInt(url.searchParams.get("minRating") || "0")

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (providerId) {
      where.providerId = providerId
    }

    if (userId) {
      where.userId = userId
    }

    if (minRating > 0) {
      where.rating = { gte: minRating }
    }

    // Obtener reseñas
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          provider: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          request: {
            select: {
              id: true,
              description: true,
              serviceType: {
                select: {
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error obteniendo reseñas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Crear nueva reseña
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { requestId, rating, comment } = body

    // Validaciones
    if (!requestId || !rating) {
      return NextResponse.json({ error: "ID de solicitud y calificación son requeridos" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "La calificación debe estar entre 1 y 5" }, { status: 400 })
    }

    // Verificar que la solicitud existe y está completada
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        review: true,
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    // Solo el cliente puede dejar reseña
    if (serviceRequest.clientId !== user.id) {
      return NextResponse.json({ error: "No autorizado para dejar reseña" }, { status: 403 })
    }

    // La solicitud debe estar completada
    if (serviceRequest.status !== "COMPLETED") {
      return NextResponse.json({ error: "Solo se pueden reseñar servicios completados" }, { status: 400 })
    }

    // No debe existir una reseña previa
    if (serviceRequest.review) {
      return NextResponse.json({ error: "Ya existe una reseña para esta solicitud" }, { status: 400 })
    }

    // Debe tener un proveedor asignado
    if (!serviceRequest.providerId) {
      return NextResponse.json({ error: "No se puede reseñar sin proveedor asignado" }, { status: 400 })
    }

    // Crear reseña en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la reseña
      const review = await tx.review.create({
        data: {
          requestId,
          userId: user.id,
          providerId: serviceRequest.providerId!,
          rating,
          comment: comment || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          provider: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          request: {
            select: {
              id: true,
              description: true,
              serviceType: {
                select: {
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
      })

      // Actualizar estadísticas del proveedor
      const providerStats = await tx.review.aggregate({
        where: { providerId: serviceRequest.providerId! },
        _avg: { rating: true },
        _count: { rating: true },
      })

      await tx.provider.update({
        where: { userId: serviceRequest.providerId! },
        data: {
          rating: providerStats._avg.rating || 0,
          reviewCount: providerStats._count.rating,
        },
      })

      return review
    })

    return NextResponse.json({ review: result }, { status: 201 })
  } catch (error) {
    console.error("Error creando reseña:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
