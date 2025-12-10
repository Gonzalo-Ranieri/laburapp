import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener solicitudes de servicio
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const status = url.searchParams.get("status") || ""
    const role = url.searchParams.get("role") || "client" // client o provider

    const skip = (page - 1) * limit

    // Construir filtros según el rol
    const where: any = {}

    if (role === "provider") {
      where.providerId = user.id
    } else {
      where.clientId = user.id
    }

    if (status) {
      where.status = status
    }

    // Obtener solicitudes
    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
          serviceType: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
          },
          tracking: {
            select: {
              id: true,
              status: true,
              latitude: true,
              longitude: true,
              timestamp: true,
            },
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.serviceRequest.count({ where }),
    ])

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error obteniendo solicitudes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Crear nueva solicitud de servicio
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { serviceTypeId, description, address, latitude, longitude, scheduledDate, images = [] } = body

    // Validaciones
    if (!serviceTypeId || !description || !address || !scheduledDate) {
      return NextResponse.json(
        { error: "Tipo de servicio, descripción, dirección y fecha son requeridos" },
        { status: 400 },
      )
    }

    // Verificar que el tipo de servicio existe
    const serviceType = await prisma.serviceType.findUnique({
      where: { id: serviceTypeId },
    })

    if (!serviceType) {
      return NextResponse.json({ error: "Tipo de servicio no válido" }, { status: 400 })
    }

    // Validar fecha
    const scheduledDateTime = new Date(scheduledDate)
    if (scheduledDateTime <= new Date()) {
      return NextResponse.json({ error: "La fecha debe ser futura" }, { status: 400 })
    }

    // Crear solicitud
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        clientId: user.id,
        serviceTypeId,
        description,
        address,
        latitude: latitude ? Number.parseFloat(latitude) : null,
        longitude: longitude ? Number.parseFloat(longitude) : null,
        scheduledDate: scheduledDateTime,
        status: "PENDING",
        images: Array.isArray(images) ? images : [],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        serviceType: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    })

    return NextResponse.json({ request: serviceRequest }, { status: 201 })
  } catch (error) {
    console.error("Error creando solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
