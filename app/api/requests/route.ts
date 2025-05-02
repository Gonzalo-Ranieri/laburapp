import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Obtener solicitudes de servicio del usuario
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const asProvider = searchParams.get("asProvider") === "true"

    const whereClause: any = {}

    if (asProvider) {
      whereClause.providerId = user.id
    } else {
      whereClause.clientId = user.id
    }

    if (status) {
      whereClause.status = status.toUpperCase()
    }

    const requests = await prisma.serviceRequest.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        serviceType: true,
        review: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error al obtener solicitudes:", error)
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
  }
}

// POST: Crear una nueva solicitud de servicio
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { serviceTypeId, providerId, description, address, scheduledDate, images = [] } = body

    if (!serviceTypeId || !description || !address || !scheduledDate) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Crear solicitud de servicio
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        clientId: user.id,
        providerId,
        serviceTypeId,
        description,
        address,
        scheduledDate: new Date(scheduledDate),
        images,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        serviceType: true,
      },
    })

    return NextResponse.json(serviceRequest, { status: 201 })
  } catch (error) {
    console.error("Error al crear solicitud:", error)
    return NextResponse.json({ error: "Error al crear solicitud" }, { status: 500 })
  }
}
